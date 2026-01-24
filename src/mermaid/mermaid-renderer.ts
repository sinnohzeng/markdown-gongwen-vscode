import * as vscode from 'vscode';
import { ColorThemeKind } from 'vscode';
import * as cheerio from 'cheerio';

type MermaidRenderOptions = {
  theme: 'default' | 'dark';
  fontFamily?: string;
  height?: number; // Height in pixels based on line count
};

let webviewView: vscode.WebviewView | undefined;
let webviewLoaded: Promise<void>;
let resolveWebviewLoaded: (() => void) | undefined;
// Track pending render requests to handle concurrent renders (hover + decoration)
// Key: requestId, Value: { resolve, reject, timeoutId }
const pendingRenders = new Map<string, { 
  resolve: (svg: string) => void; 
  reject: (error: Error) => void;
  timeoutId: NodeJS.Timeout;
}>();
let renderRequestCounter = 0;

// Memoization cache for decorations
const decorationCache = new Map<string, Promise<string>>();

// Store disposables for cleanup
let messageHandlerDisposable: vscode.Disposable | undefined;
let initTimeoutId: NodeJS.Timeout | undefined;

// Request timeout (30 seconds)
const REQUEST_TIMEOUT_MS = 30000;


function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  // Use local Mermaid bundle (no internet required)
  const mermaidScriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'assets', 'mermaid', 'mermaid.esm.min.mjs')
  );
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
</head>
<body>
  <script type="module">
    import mermaid from '${mermaidScriptUri}';
    
    const vscode = acquireVsCodeApi();

    function getDiagramType(source) {
      const firstNonEmptyLine = source
        .split(/\\r?\\n/)
        .map((l) => l.trim())
        .find((l) => l.length > 0);
      if (!firstNonEmptyLine) return 'unknown';
      return firstNonEmptyLine.split(/\\s+/)[0] || 'unknown';
    }

    
    window.addEventListener('message', async (event) => {
      const data = event.data;
      
      if (!data || !data.source) {
        return;
      }

      const requestId = data.requestId;
      const diagramType = getDiagramType(data.source);
      
      try {
        // Initialize Mermaid with theme and font settings
        mermaid.initialize({
          theme: data.darkMode ? 'dark' : 'default',
          fontFamily: data.fontFamily || undefined,
          startOnLoad: false,
          securityLevel: 'strict',
        });
        // Render the diagram - Mermaid v11 returns { svg } from render()
        // Gantt depends on parentElement.offsetWidth; when webview layout width is 0,
        // create a hidden container with explicit width to give Mermaid a real layout width.
        let svg;
        let renderContainer;
        // Use timestamp + random to ensure unique render IDs (prevents conflicts with concurrent renders)
        const renderId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
        
        if (diagramType === 'gantt') {
          renderContainer = document.createElement('div');
          renderContainer.style.position = 'absolute';
          renderContainer.style.left = '-10000px';
          renderContainer.style.top = '0';
          renderContainer.style.width = '2000px';
          renderContainer.style.height = '1px';
          renderContainer.style.visibility = 'hidden';
          document.body?.appendChild(renderContainer);
        }

        try {
          // Only pass container parameter if it exists (Mermaid v11 supports optional container)
          // Passing undefined explicitly might cause issues, so conditionally call render
          const result = renderContainer
            ? await mermaid.render(renderId, data.source, renderContainer)
            : await mermaid.render(renderId, data.source);
          svg = result.svg;
        } finally {
          // Always clean up container if it was created
          if (renderContainer) {
            renderContainer.remove();
          }
        }
        
        // Send SVG string back with requestId to match to correct pending render
        vscode.postMessage({ svg, requestId });
      } catch (error) {
        // Send detailed error information back with requestId
        const errorInfo = {
          message: error?.message || 'Unknown error',
          name: error?.name || 'Error',
          stack: error?.stack || '',
          toString: error?.toString?.() || String(error)
        };
        // Include full error details - prioritize message, fallback to toString
        const errorMessage = errorInfo.message || errorInfo.toString || 'Unknown error occurred';
        vscode.postMessage({ error: errorMessage, requestId });
      }
    });
    
    // Signal ready after mermaid is loaded
    vscode.postMessage({ ready: true });
  </script>
</body>
</html>`;
}

class MermaidWebviewViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'mdInline.mermaidRenderer';

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    if (!extensionContext) {
      return;
    }
    
    // Dispose previous message handler if exists (prevent memory leak on webview recreation)
    messageHandlerDisposable?.dispose();
    
    // Configure webview to allow access to local assets
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(extensionContext.extensionUri, 'assets')
      ]
    };
    
    webviewView.webview.html = getWebviewContent(webviewView.webview, extensionContext.extensionUri);

    // Store reference BEFORE setting up handlers (like Markless does)
    setWebviewView(webviewView);
    
    // Resolve webviewLoaded immediately when webview is created (like Markless)
    // Don't wait for "ready" message - the webview is ready when it's created
    resolveWebviewLoaded?.();

    // Handle messages from the webview - store disposable for cleanup
    messageHandlerDisposable = webviewView.webview.onDidReceiveMessage((message) => {
      // Ignore "ready" messages - we don't need them anymore
      if (message && message.ready) {
        return;
      }

      if (message && message.error) {
        const requestId = message.requestId;
        if (requestId && pendingRenders.has(requestId)) {
          const { resolve, timeoutId } = pendingRenders.get(requestId)!;
          // Clear timeout since we're handling the error
          clearTimeout(timeoutId);
          // Create a proper error SVG - height will be adjusted in getMermaidDecoration
          const isDark = vscode.window.activeColorTheme.kind === ColorThemeKind.Dark ||
            vscode.window.activeColorTheme.kind === ColorThemeKind.HighContrast;
          const errorSvg = createErrorSvg(
            message.error,
            400, // Default width - will be resized later
            200, // Default height - will be resized later
            isDark
          );
          resolve(errorSvg);
          pendingRenders.delete(requestId);
        }
        return;
      }

      // Handle SVG response (with requestId) or legacy string format
      if (message && message.requestId && pendingRenders.has(message.requestId)) {
        const { resolve, timeoutId } = pendingRenders.get(message.requestId)!;
        // Clear timeout since we received the response
        clearTimeout(timeoutId);
        const svg = message.svg || message; // Support both object and string format
        resolve(svg);
        pendingRenders.delete(message.requestId);
        return;
      }

      // Legacy support: string message without requestId (for backwards compatibility)
      if (typeof message === 'string') {
        // If there's only one pending render, use it (backwards compatibility)
        if (pendingRenders.size === 1) {
          const [requestId, { resolve, timeoutId }] = Array.from(pendingRenders.entries())[0];
          clearTimeout(timeoutId);
          resolve(message);
          pendingRenders.delete(requestId);
        }
      }
    }, null, []);
  }
}

function setWebviewView(view: vscode.WebviewView): void {
  webviewView = view;
}

let extensionContext: vscode.ExtensionContext | undefined;

export function initMermaidRenderer(context: vscode.ExtensionContext): void {
  extensionContext = context;

  // Initialize the webview loaded promise
  webviewLoaded = new Promise<void>((resolve) => {
    resolveWebviewLoaded = resolve;
  });

  // Register the webview view provider
  const provider = new MermaidWebviewViewProvider();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      MermaidWebviewViewProvider.viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // Open the mermaid view briefly to initialize it, then switch back
  // This is needed because the webview won't be created until it's visible
  vscode.commands.executeCommand('mdInline.mermaidRenderer.focus')
    .then(() => {
      // Switch back to explorer after a brief moment
      // Store timeout ID for cleanup
      initTimeoutId = setTimeout(() => {
        vscode.commands.executeCommand('workbench.view.explorer');
        initTimeoutId = undefined;
      }, 100);
    });
}

function requestSvg(data: { source: string; darkMode: boolean; fontFamily?: string }): Promise<string> {
  return requestSvgWithTimeout(data, REQUEST_TIMEOUT_MS);
}

/**
 * Request SVG with configurable timeout and optional cancellation token
 * @param data - Render request data
 * @param timeoutMs - Timeout in milliseconds
 * @param cancellationToken - Optional cancellation token (for hover requests)
 */
function requestSvgWithTimeout(
  data: { source: string; darkMode: boolean; fontFamily?: string },
  timeoutMs: number,
  cancellationToken?: vscode.CancellationToken
): Promise<string> {
  if (!webviewView) {
    throw new Error('Webview not available');
  }

  // Generate unique request ID for this render
  const requestId = `req-${Date.now()}-${++renderRequestCounter}`;

  // Create promise BEFORE posting message (like Markless pattern)
  // Track pending renders in a Map to handle concurrent requests
  return new Promise<string>((resolve, reject) => {
    if (!webviewView) {
      reject(new Error('Webview not available'));
      return;
    }
    
    // Check cancellation token before starting
    if (cancellationToken?.isCancellationRequested) {
      reject(new vscode.CancellationError());
      return;
    }
    
    // Set up cancellation listener if token provided
    let cancellationListener: vscode.Disposable | undefined;
    if (cancellationToken) {
      cancellationListener = cancellationToken.onCancellationRequested(() => {
        if (pendingRenders.has(requestId)) {
          const { timeoutId } = pendingRenders.get(requestId)!;
          clearTimeout(timeoutId);
          pendingRenders.delete(requestId);
          cancellationListener?.dispose();
          reject(new vscode.CancellationError());
        }
      });
    }
    
    // Set up timeout to prevent promise leaks from failed requests
    const timeoutId = setTimeout(() => {
      if (pendingRenders.has(requestId)) {
        pendingRenders.delete(requestId);
        cancellationListener?.dispose();
        reject(new Error('Mermaid render request timed out'));
      }
    }, timeoutMs);
    
    // Wrap resolve/reject to clear timeout and cancellation listener
    const wrappedResolve = (value: string) => {
      clearTimeout(timeoutId);
      cancellationListener?.dispose();
      resolve(value);
    };
    
    const wrappedReject = (error: Error) => {
      clearTimeout(timeoutId);
      cancellationListener?.dispose();
      reject(error);
    };
    
    // Store resolve/reject with timeout ID in Map
    pendingRenders.set(requestId, { 
      resolve: wrappedResolve, 
      reject: wrappedReject,
      timeoutId 
    });

    try {
      // Include requestId in message so webview can send it back
      webviewView.webview.postMessage({ ...data, requestId });
    } catch (error) {
      // Clean up on error
      clearTimeout(timeoutId);
      cancellationListener?.dispose();
      pendingRenders.delete(requestId);
      reject(error);
    }
  });
}

/**
 * Render Mermaid SVG at natural size (without height constraints)
 * Used to get actual diagram dimensions for hover sizing
 * @param source - Mermaid diagram source code
 * @param options - Rendering options including theme and fontFamily
 * @param cancellationToken - Optional cancellation token for hover requests (shorter timeout)
 */
export async function renderMermaidSvgNatural(
  source: string,
  options: { theme: 'default' | 'dark'; fontFamily?: string },
  cancellationToken?: vscode.CancellationToken
): Promise<string> {
  if (!extensionContext) {
    throw new Error('Mermaid renderer not initialized. Call initMermaidRenderer first.');
  }

  await webviewLoaded;

  if (!webviewView) {
    throw new Error('Failed to create mermaid webview');
  }

  const darkMode = options.theme === 'dark';
  
  // Check cancellation before starting expensive operation
  if (cancellationToken?.isCancellationRequested) {
    throw new vscode.CancellationError();
  }
  
  // Use shorter timeout for hover requests (5 seconds) to match VS Code's hover timeout
  // Regular requests use the default 30-second timeout
  const timeoutMs = cancellationToken ? 5000 : REQUEST_TIMEOUT_MS;
  
  // Request SVG without processing (get natural dimensions)
  const svgString = await requestSvgWithTimeout(
    { source, darkMode, fontFamily: options.fontFamily },
    timeoutMs,
    cancellationToken
  );
  
  // Check cancellation again after await (in case it was cancelled during the request)
  if (cancellationToken?.isCancellationRequested) {
    throw new vscode.CancellationError();
  }
  
  // Return raw SVG without height processing
  return svgString;
}

/**
 * Create an error SVG to display when Mermaid rendering fails
 * @param errorMessage - The error message to display
 * @param width - Width of the error SVG
 * @param height - Height of the error SVG
 * @param isDark - Whether to use dark theme colors
 * @returns SVG string with error message
 */
export function createErrorSvg(errorMessage: string, width: number, height: number, isDark: boolean): string {
  const bgColor = isDark ? '#2d2d2d' : '#f5f5f5';
  const textColor = isDark ? '#ff6b6b' : '#d32f2f';
  const borderColor = isDark ? '#ff6b6b' : '#d32f2f';
  const secondaryTextColor = isDark ? '#cccccc' : '#666666';
  
  // Use the full error message - don't truncate aggressively
  // Split into lines that fit within the SVG width
  const maxLineLength = Math.floor((width - 80) / 7); // Approximate chars per line based on font size
  const words = errorMessage.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    if (testLine.length > maxLineLength && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Limit to reasonable number of lines to fit in height
  const maxLines = Math.floor((height - 100) / 18); // 18px line height
  const displayLines = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    displayLines.push('... (error message truncated)');
  }
  
  const lineHeight = 18;
  const padding = 20;
  const iconSize = 40;
  const titleY = padding + iconSize + 15;
  const messageStartY = titleY + 25;
  
  const textLines = displayLines.map((line, i) => 
    `<tspan x="${padding}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
  ).join('');
  
  // Calculate actual height needed based on content
  const contentHeight = Math.max(height, padding * 2 + iconSize + 25 + (displayLines.length * lineHeight));
  
  return `<svg width="${width}" height="${contentHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${contentHeight}" fill="${bgColor}" stroke="${borderColor}" stroke-width="2" rx="4"/>
  <circle cx="${padding + iconSize / 2}" cy="${padding + iconSize / 2}" r="${iconSize / 2}" fill="${borderColor}" opacity="0.2"/>
  <text x="${padding + iconSize / 2}" y="${padding + iconSize / 2 + 5}" font-family="Arial, sans-serif" font-size="24" fill="${borderColor}" text-anchor="middle" font-weight="bold">⚠</text>
  <text x="${padding + iconSize + 15}" y="${titleY}" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" font-weight="bold">Mermaid Rendering Error</text>
  <text x="${padding}" y="${messageStartY}" font-family="monospace, Arial, sans-serif" font-size="11" fill="${secondaryTextColor}">
    ${textLines}
  </text>
</svg>`;
}

/**
 * Escape XML special characters for use in SVG text
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Process SVG to adjust dimensions based on line count
 * Similar to Markless implementation
 */
function processSvg(svgString: string, height: number): string {
  const $ = cheerio.load(svgString, { xmlMode: true });
  const svgNode = $('svg').first();
  
  if (svgNode.length === 0) {
    return svgString;
  }

  // Get original dimensions from height attribute or viewBox
  // Note: width might be "100%" which we need to handle
  const widthAttr = svgNode.attr('width') || '0';
  let originalHeight = parseFloat(svgNode.attr('height') || '0');
  let originalWidth = widthAttr === '100%' ? 0 : parseFloat(widthAttr) || 0;
  
  // If height/width not in attributes, try viewBox
  if ((originalHeight === 0 || originalWidth === 0) && svgNode.attr('viewBox')) {
    const viewBox = svgNode.attr('viewBox')!.split(/\s+/);
    if (viewBox.length >= 4) {
      const viewBoxWidth = parseFloat(viewBox[2]) || 0;
      const viewBoxHeight = parseFloat(viewBox[3]) || 0;
      if (originalWidth === 0 && viewBoxWidth > 0) {
        originalWidth = viewBoxWidth;
      }
      if (originalHeight === 0 && viewBoxHeight > 0) {
        originalHeight = viewBoxHeight;
      }
    }
  }
  
  // Fix invalid viewBox with zero width (bug in Mermaid gantt charts)
  // IMPORTANT: Preserve the original viewBox origin (min-x, min-y) to avoid mirroring
  const currentViewBox = svgNode.attr('viewBox');
  if (currentViewBox) {
    const viewBoxParts = currentViewBox.split(/\s+/);
    if (viewBoxParts.length >= 4) {
      const viewBoxMinX = parseFloat(viewBoxParts[0]) || 0;
      const viewBoxMinY = parseFloat(viewBoxParts[1]) || 0;
      const viewBoxWidth = parseFloat(viewBoxParts[2]) || 0;
      const viewBoxHeight = parseFloat(viewBoxParts[3]) || 0;
      
      // If viewBox width is 0, fix it by using calculated width or minimum
      if (viewBoxWidth === 0 && viewBoxHeight > 0) {
        // Try to get width from SVG content bounds, or use a calculated width
        let fixedWidth = originalWidth;
        
        // If we still don't have a width, calculate from aspect ratio or use minimum
        if (fixedWidth === 0) {
          // For gantt charts, we need a wider viewBox to accommodate the content
          // Gantt charts often have content that extends beyond the initial viewBox
          // Use a wider aspect ratio (at least 3:1) to ensure content fits
          // Also account for potential negative coordinates by using a larger width
          fixedWidth = Math.max(600, viewBoxHeight * 3);
        }
        
        // Fix the viewBox attribute - preserve original origin coordinates
        // For gantt charts with negative coordinates, we might need to adjust min-x
        // But to avoid mirroring, we'll keep the original origin
        const fixedViewBox = `${viewBoxMinX} ${viewBoxMinY} ${fixedWidth} ${viewBoxHeight}`;
        svgNode.attr('viewBox', fixedViewBox);
        
        // Always update originalWidth and width attribute when fixing viewBox
        // This ensures we have valid dimensions for later calculations
        originalWidth = fixedWidth;
        // Remove percentage-based width and set explicit pixel value
        svgNode.attr('width', `${fixedWidth}`);
        
      }
    }
  }
  
  // Calculate width from aspect ratio using height as the limiting factor
  // Formula: newWidth = (originalWidth / originalHeight) * limitingHeight
  // This maintains aspect ratio for both wide and tall charts
  // Use viewBox dimensions if available, as they're more reliable
  let calculatedWidth: number | undefined;
  let aspectRatio: number | undefined;
  
  // Get final dimensions from viewBox if available (after any fixes)
  // Re-read viewBox after potential fix to ensure we have the latest value
  const finalViewBox = svgNode.attr('viewBox');
  if (finalViewBox) {
    const viewBoxParts = finalViewBox.split(/\s+/);
    if (viewBoxParts.length >= 4) {
      const viewBoxWidth = parseFloat(viewBoxParts[2]) || 0;
      const viewBoxHeight = parseFloat(viewBoxParts[3]) || 0;
      if (viewBoxWidth > 0 && viewBoxHeight > 0) {
        // Use viewBox dimensions for aspect ratio (most reliable)
        aspectRatio = viewBoxWidth / viewBoxHeight;
        calculatedWidth = aspectRatio * height;
        // Update originalWidth to match fixed viewBox for consistency
        if (originalWidth === 0 || originalWidth !== viewBoxWidth) {
          originalWidth = viewBoxWidth;
        }
      }
    }
  }
  
  // Fallback to attribute dimensions if viewBox calculation didn't work
  if (!calculatedWidth && originalWidth > 0 && originalHeight > 0) {
    aspectRatio = originalWidth / originalHeight;
    calculatedWidth = aspectRatio * height;
  }
  
  // Final fallback: use reasonable default
  // Ensure calculatedWidth is always assigned
  if (!calculatedWidth || calculatedWidth <= 0) {
    // For wide charts (like gantt), assume at least 2:1 ratio
    calculatedWidth = Math.max(400, height * 2);
    if (!aspectRatio) {
      aspectRatio = calculatedWidth / height;
    }
  }

  // Set explicit width and height attributes to maintain aspect ratio
  // Remove any CSS max-width that might constrain wide charts
  svgNode.css('max-width', '');
  
  // Set dimensions - but preserve the original viewBox to avoid mirroring
  // The viewBox defines the coordinate system, so we should keep it as-is
  // calculatedWidth is guaranteed to be assigned at this point
  svgNode.attr('width', `${calculatedWidth}px`);
  svgNode.attr('height', `${height}px`);
  
  // Keep original preserveAspectRatio to maintain alignment
  // Use 'meet' to ensure content fits within bounds while maintaining aspect ratio
  if (!svgNode.attr('preserveAspectRatio')) {
    svgNode.attr('preserveAspectRatio', 'xMinYMin meet');
  }

  // Extract only the SVG element, not the full HTML document
  // Use toString() to get the SVG element with its attributes (like Markless)
  const processedSvg = svgNode.toString();

  return processedSvg;
}

/**
 * Memoized function to get Mermaid decoration
 * Caches based on source, theme, fontFamily, and height
 * Uses the global decorationCache to avoid creating unbounded caches
 */
function memoizeMermaidDecoration(
  func: (source: string, darkMode: boolean, height: number, fontFamily?: string) => Promise<string>
): (source: string, darkMode: boolean, height: number, fontFamily?: string) => Promise<string> {
  return (source: string, darkMode: boolean, height: number, fontFamily?: string): Promise<string> => {
    const key = `${source}|${darkMode}|${height}|${fontFamily ?? ''}`;
    if (!decorationCache.has(key)) {
      decorationCache.set(key, func(source, darkMode, height, fontFamily));
    }
    return decorationCache.get(key)!;
  };
}

const getMermaidDecoration = memoizeMermaidDecoration(async (
  source: string,
  darkMode: boolean,
  height: number,
  fontFamily?: string
): Promise<string> => {
  await webviewLoaded;

  const svgString = await requestSvg({ source, darkMode, fontFamily });
  
  // Check if this is an error SVG (contains "Mermaid Rendering Error")
  if (svgString.includes('Mermaid Rendering Error')) {
    // Recreate error SVG with proper dimensions
    const errorSvg = createErrorSvg(
      extractErrorMessage(svgString) || 'Rendering failed',
      Math.max(400, height * 2), // Width based on height
      height,
      darkMode
    );
    return errorSvg;
  }
  
  const processedSvg = processSvg(svgString, height);
  
  return processedSvg;
});

/**
 * Extract error message from error SVG
 */
function extractErrorMessage(errorSvg: string): string | null {
  const match = errorSvg.match(/<tspan[^>]*>([^<]+)<\/tspan>/g);
  if (match && match.length > 0) {
    // Get the first tspan content (skip the title line)
    const messageLines = match.slice(1).map(line => {
      const contentMatch = line.match(/>([^<]+)</);
      return contentMatch ? contentMatch[1] : '';
    });
    return messageLines.join(' ').trim() || null;
  }
  return null;
}

export async function renderMermaidSvg(
  source: string,
  options: MermaidRenderOptions & { numLines?: number }
): Promise<string> {
  if (!extensionContext) {
    throw new Error('Mermaid renderer not initialized. Call initMermaidRenderer first.');
  }

  await webviewLoaded;

  if (!webviewView) {
    throw new Error('Failed to create mermaid webview');
  }

  const darkMode = options.theme === 'dark';
  // Calculate height based on line count (like Markless: (numLines + 2) * lineHeight)
  // Default to 200px if numLines not provided
  const editorConfig = vscode.workspace.getConfiguration('editor');
  let lineHeight = editorConfig.get<number>('lineHeight', 0);
  
  // If lineHeight is 0 or invalid, calculate from fontSize (like Markless does)
  if (lineHeight === 0 || lineHeight < 8) {
    const fontSize = editorConfig.get<number>('fontSize', 14);
    // Use platform-appropriate multiplier (Markless uses 1.5 for macOS, 1.35 for others)
    const multiplier = process.platform === 'darwin' ? 1.5 : 1.35;
    lineHeight = Math.round(multiplier * fontSize);
    if (lineHeight < 8) {
      lineHeight = 8; // Minimum line height
    }
  }
  
  const numLines = options.numLines || 5;
  const height = options.height || ((numLines + 2) * lineHeight);

  return getMermaidDecoration(source, darkMode, height, options.fontFamily);
}

export function svgToDataUri(svg: string): string {
  // Use URL encoding instead of base64 for SVG data URIs
  // URL encoding is typically shorter for SVG content and avoids truncation issues
  // in VS Code's MarkdownString which may have size limits
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}


export function disposeMermaidRenderer(): void {
  // Clear timeout if still pending
  if (initTimeoutId) {
    clearTimeout(initTimeoutId);
    initTimeoutId = undefined;
  }
  
  // Clear all pending render timeouts and reject promises
  for (const [requestId, { reject, timeoutId }] of pendingRenders.entries()) {
    clearTimeout(timeoutId);
    reject(new Error('Mermaid renderer disposed'));
  }
  pendingRenders.clear();
  
  // Dispose message handler subscription
  messageHandlerDisposable?.dispose();
  messageHandlerDisposable = undefined;
  
  // Clear decoration cache
  decorationCache.clear();
  
  // Clear webview reference
  webviewView = undefined;
  resolveWebviewLoaded = undefined;
}
