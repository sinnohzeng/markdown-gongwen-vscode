import * as vscode from 'vscode';
import { ColorThemeKind } from 'vscode';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

type MermaidRenderOptions = {
  theme: 'default' | 'dark';
  fontFamily?: string;
  height?: number; // Height in pixels based on line count
};

let webviewView: vscode.WebviewView | undefined;
let webviewLoaded: Promise<void>;
let resolveWebviewLoaded: (() => void) | undefined;
// Track pending render requests to handle concurrent renders (hover + decoration)
// Key: requestId, Value: { resolve, reject }
const pendingRenders = new Map<string, { resolve: (svg: string) => void; reject: (error: Error) => void }>();
let renderRequestCounter = 0;

// Memoization cache for decorations
const decorationCache = new Map<string, Promise<string>>();

// Store most recent layout metrics for gantt verification (included in saved HTML)
let lastGanttLayoutMetrics: any = null;

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

    function measureLayout() {
      // We log multiple metrics because different ones can be 0 depending on visibility/layout.
      const bodyRect = document.body ? document.body.getBoundingClientRect() : null;
      const docElRect = document.documentElement ? document.documentElement.getBoundingClientRect() : null;

      // Create an offscreen container with explicit width to test whether layout width is available.
      const probe = document.createElement('div');
      probe.id = 'mdInline-mermaid-width-probe';
      probe.style.position = 'absolute';
      probe.style.left = '-10000px';
      probe.style.top = '0';
      probe.style.width = '2000px';
      probe.style.height = '1px';
      probe.style.visibility = 'hidden';
      document.body?.appendChild(probe);
      const probeRect = probe.getBoundingClientRect();
      probe.remove();

      return {
        visibilityState: document.visibilityState,
        hidden: document.hidden,
        windowInnerWidth: window.innerWidth,
        windowInnerHeight: window.innerHeight,
        documentElementClientWidth: document.documentElement?.clientWidth ?? null,
        documentElementClientHeight: document.documentElement?.clientHeight ?? null,
        bodyClientWidth: document.body?.clientWidth ?? null,
        bodyClientHeight: document.body?.clientHeight ?? null,
        bodyRectWidth: bodyRect ? bodyRect.width : null,
        bodyRectHeight: bodyRect ? bodyRect.height : null,
        documentElementRectWidth: docElRect ? docElRect.width : null,
        documentElementRectHeight: docElRect ? docElRect.height : null,
        probeRectWidth: probeRect.width,
        probeRectHeight: probeRect.height,
      };
    }
    
    window.addEventListener('message', async (event) => {
      const data = event.data;
      
      if (!data || !data.source) {
        console.warn('[Mermaid Renderer] Invalid message received:', data);
        return;
      }

      const requestId = data.requestId;
      const diagramType = getDiagramType(data.source);
      
      console.log('[Mermaid Renderer] Received render request:', {
        sourceLength: data.source?.length || 0,
        sourcePreview: data.source?.substring(0, 100) + (data.source && data.source.length > 100 ? '...' : ''),
        diagramType,
        darkMode: data.darkMode,
        fontFamily: data.fontFamily,
      });
      
      try {
        // Verification log: gantt rendering depends on available layout width.
        // If the webview is effectively "layout-hidden" the width can be 0, producing broken gantt SVGs.
        if (diagramType === 'gantt') {
          const layout = measureLayout();
          console.log('[Mermaid Renderer] Gantt layout metrics (pre-render):', layout);
          vscode.postMessage({
            debug: {
              kind: 'gantt-layout-pre-render',
              layout,
            },
          });
        }

        // Initialize Mermaid with theme and font settings
        mermaid.initialize({
          theme: data.darkMode ? 'dark' : 'default',
          fontFamily: data.fontFamily || undefined,
          startOnLoad: false,
          securityLevel: 'strict',
        });
        
        console.log('[Mermaid Renderer] Starting render...');
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
        
        console.log('[Mermaid Renderer] Render successful:', {
          svgLength: svg.length,
          svgPreview: svg.substring(0, 200) + (svg.length > 200 ? '...' : ''),
        });
        
        // Print full SVG to console for debugging
        console.log('[Mermaid Renderer] Full SVG from mermaid.render():', svg);
        
        // Send SVG string back with requestId to match to correct pending render
        vscode.postMessage({ svg, requestId });
      } catch (error) {
        console.error('[Mermaid Renderer] Render error:', {
          error: error.message || 'Unknown error',
          stack: error.stack,
          sourcePreview: data.source?.substring(0, 200) + (data.source && data.source.length > 200 ? '...' : ''),
        });
        // Send error message back with requestId
        vscode.postMessage({ error: error.message || 'Unknown error', requestId });
      }
    });
    
    // Signal ready after mermaid is loaded
    console.log('[Mermaid Renderer] Webview ready, Mermaid loaded');
    vscode.postMessage({ ready: true });
  </script>
</body>
</html>`;
}

class MermaidWebviewViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'mdInline.mermaidRenderer';

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    console.log('[Mermaid Renderer] Resolving webview view');
    if (!extensionContext) {
      console.error('[Mermaid Renderer] Extension context not available');
      return;
    }
    
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

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((message) => {
      // Ignore "ready" messages - we don't need them anymore
      if (message && message.ready) {
        console.log('[Mermaid Renderer] Webview signaled ready (ignored, already resolved)');
        return;
      }

      // Debug/verification messages from the webview (do not resolve the render promise)
      if (message && typeof message === 'object' && message.debug) {
        console.log('[Mermaid Renderer] Webview debug:', message.debug);
        
        // Store layout metrics for gantt charts (for verification in saved HTML)
        if (message.debug.kind === 'gantt-layout-pre-render' && message.debug.layout) {
          lastGanttLayoutMetrics = message.debug.layout;
        }
        return;
      }

      if (message && message.error) {
        console.error('[Mermaid Renderer] Render failed:', message.error);
        const requestId = message.requestId;
        if (requestId && pendingRenders.has(requestId)) {
          const { resolve } = pendingRenders.get(requestId)!;
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
        const { resolve } = pendingRenders.get(message.requestId)!;
        const svg = message.svg || message; // Support both object and string format
        console.log('[Mermaid Renderer] Received SVG:', {
          requestId: message.requestId,
          svgLength: typeof svg === 'string' ? svg.length : 0,
          svgPreview: typeof svg === 'string' ? (svg.substring(0, 200) + (svg.length > 200 ? '...' : '')) : 'object',
        });
        // Print full SVG to console for debugging
        if (typeof svg === 'string') {
          console.log('[Mermaid Renderer] Full SVG received from webview:', svg);
        }
        resolve(svg);
        pendingRenders.delete(message.requestId);
        return;
      }

      // Legacy support: string message without requestId (for backwards compatibility)
      if (typeof message === 'string') {
        // If there's only one pending render, use it (backwards compatibility)
        if (pendingRenders.size === 1) {
          const [requestId, { resolve }] = Array.from(pendingRenders.entries())[0];
          console.log('[Mermaid Renderer] Received legacy SVG string (no requestId):', {
            svgLength: message.length,
            svgPreview: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
          });
          resolve(message);
          pendingRenders.delete(requestId);
        } else {
          console.warn('[Mermaid Renderer] Received SVG string but multiple pending renders, cannot match');
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
  console.log('[Mermaid Renderer] Initializing Mermaid renderer');
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
      setTimeout(() => {
        vscode.commands.executeCommand('workbench.view.explorer');
      }, 100);
    });
  
  console.log('[Mermaid Renderer] Webview view provider registered');
}

function requestSvg(data: { source: string; darkMode: boolean; fontFamily?: string }): Promise<string> {
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
    
    // Store resolve/reject in Map with requestId
    pendingRenders.set(requestId, { resolve, reject });

    try {
      // Include requestId in message so webview can send it back
      webviewView.webview.postMessage({ ...data, requestId });
    } catch (error) {
      pendingRenders.delete(requestId);
      reject(error);
    }
  });
}

/**
 * Render Mermaid SVG at natural size (without height constraints)
 * Used to get actual diagram dimensions for hover sizing
 */
export async function renderMermaidSvgNatural(
  source: string,
  options: { theme: 'default' | 'dark'; fontFamily?: string }
): Promise<string> {
  if (!extensionContext) {
    throw new Error('Mermaid renderer not initialized. Call initMermaidRenderer first.');
  }

  await webviewLoaded;

  if (!webviewView) {
    throw new Error('Failed to create mermaid webview');
  }

  const darkMode = options.theme === 'dark';
  
  // Request SVG without processing (get natural dimensions)
  const svgString = await requestSvg({ source, darkMode, fontFamily: options.fontFamily });
  
  // Print full SVG to console for debugging
  console.log('[Mermaid Renderer] Full SVG from renderMermaidSvgNatural:', svgString);
  
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
  
  // Truncate error message if too long
  const maxMessageLength = 80;
  const displayMessage = errorMessage.length > maxMessageLength 
    ? errorMessage.substring(0, maxMessageLength) + '...'
    : errorMessage;
  
  // Split long messages into multiple lines
  const words = displayMessage.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const maxLineLength = 50;
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length > maxLineLength && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  
  const lineHeight = 20;
  const padding = 20;
  const iconSize = 40;
  const textY = padding + iconSize + 15;
  const textLines = lines.map((line, i) => 
    `<tspan x="${padding + iconSize + 15}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
  ).join('');
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${bgColor}" stroke="${borderColor}" stroke-width="2" rx="4"/>
  <circle cx="${padding + iconSize / 2}" cy="${padding + iconSize / 2}" r="${iconSize / 2}" fill="${borderColor}" opacity="0.2"/>
  <text x="${padding + iconSize / 2}" y="${padding + iconSize / 2 + 5}" font-family="Arial, sans-serif" font-size="24" fill="${borderColor}" text-anchor="middle" font-weight="bold">⚠</text>
  <text x="${padding + iconSize + 15}" y="${textY}" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" font-weight="bold">Mermaid Rendering Error</text>
  <text x="${padding + iconSize + 15}" y="${textY + lineHeight}" font-family="Arial, sans-serif" font-size="12" fill="${secondaryTextColor}">
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
    console.warn('[Mermaid Renderer] No SVG element found in rendered output');
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
        
        console.log('[Mermaid Renderer] Fixed invalid viewBox:', {
          original: currentViewBox,
          fixed: fixedViewBox,
          preservedOrigin: `${viewBoxMinX}, ${viewBoxMinY}`,
          fixedWidth,
        });
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
    console.warn('[Mermaid Renderer] Invalid dimensions, using fallback width:', calculatedWidth);
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
  
  console.log('[Mermaid Renderer] Processed SVG:', {
    originalHeight,
    originalWidth,
    viewBox: svgNode.attr('viewBox') || 'none',
    aspectRatio: aspectRatio ? aspectRatio.toFixed(2) : 'N/A',
    calculatedWidth,
    newHeight: height,
    processedLength: processedSvg.length,
  });
  
  // Print full processed SVG to console for debugging
  console.log('[Mermaid Renderer] Full processed SVG:', processedSvg);

  return processedSvg;
}

/**
 * Memoized function to get Mermaid decoration
 * Caches based on source, theme, fontFamily, and height
 */
function memoizeMermaidDecoration(
  func: (source: string, darkMode: boolean, height: number, fontFamily?: string) => Promise<string>
): (source: string, darkMode: boolean, height: number, fontFamily?: string) => Promise<string> {
  const cache = new Map<string, Promise<string>>();
  return (source: string, darkMode: boolean, height: number, fontFamily?: string): Promise<string> => {
    const key = `${source}|${darkMode}|${height}|${fontFamily ?? ''}`;
    if (!cache.has(key)) {
      cache.set(key, func(source, darkMode, height, fontFamily));
    }
    return cache.get(key)!;
  };
}

const getMermaidDecoration = memoizeMermaidDecoration(async (
  source: string,
  darkMode: boolean,
  height: number,
  fontFamily?: string
): Promise<string> => {
  await webviewLoaded;
  
  console.log('[Mermaid Renderer] Requesting SVG render:', {
    sourceLength: source.length,
    sourcePreview: source.substring(0, 100) + (source.length > 100 ? '...' : ''),
    darkMode,
    height,
    fontFamily,
  });

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
    console.log('[Mermaid Renderer] Full error SVG:', errorSvg);
    return errorSvg;
  }
  
  const processedSvg = processSvg(svgString, height);
  
  // Print final SVG that will be returned
  console.log('[Mermaid Renderer] Final SVG returned from getMermaidDecoration:', processedSvg);
  
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

  console.log('[Mermaid Renderer] Rendering Mermaid diagram:', {
    sourceLength: source.length,
    theme: options.theme,
    fontFamily: options.fontFamily,
    numLines,
    height,
    lineHeight,
  });

  return getMermaidDecoration(source, darkMode, height, options.fontFamily);
}

export function svgToDataUri(svg: string): string {
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Save SVG to an HTML file for verification (only for gantt charts)
 * @param svg - The SVG string to save
 * @param source - The original mermaid source code
 * @param theme - The theme used ('default' or 'dark')
 */
export function saveSvgToHtml(svg: string, source: string, theme: 'default' | 'dark'): void {
  // Only save HTML files for gantt charts
  const trimmedSource = source.trim();
  if (!trimmedSource.toLowerCase().startsWith('gantt')) {
    return;
  }
  try {
    if (!extensionContext) {
      console.warn('[Mermaid Renderer] Cannot save HTML: extension context not available');
      return;
    }

    // Get workspace folder
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      console.warn('[Mermaid Renderer] Cannot save HTML: no workspace folder');
      return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const outputDir = path.join(workspaceRoot, 'docs', 'uat', 'mermaid');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate a unique filename based on source hash
    const sourceHash = createHash('sha256').update(source).digest('hex').substring(0, 8);
    const timestamp = Date.now();
    const filename = `mermaid-${sourceHash}-${timestamp}.html`;
    const filePath = path.join(outputDir, filename);

    // Create HTML content
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mermaid Chart - ${sourceHash}</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'};
      color: ${theme === 'dark' ? '#cccccc' : '#333333'};
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .source-code {
      margin-bottom: 20px;
      padding: 15px;
      background-color: ${theme === 'dark' ? '#2d2d2d' : '#f5f5f5'};
      border-radius: 4px;
      border: 1px solid ${theme === 'dark' ? '#444' : '#ddd'};
    }
    .source-code h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 600;
    }
    .source-code pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .svg-container {
      text-align: center;
      padding: 20px;
      background-color: ${theme === 'dark' ? '#252526' : '#ffffff'};
      border-radius: 4px;
      border: 1px solid ${theme === 'dark' ? '#444' : '#ddd'};
    }
    .svg-container svg {
      max-width: 100%;
      height: auto;
    }
    .info {
      margin-top: 20px;
      padding: 10px;
      background-color: ${theme === 'dark' ? '#2d2d2d' : '#f5f5f5'};
      border-radius: 4px;
      font-size: 12px;
      color: ${theme === 'dark' ? '#999' : '#666'};
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Mermaid Chart Rendering</h1>
    
    <div class="source-code">
      <h3>Source Code:</h3>
      <pre>${escapeHtml(source)}</pre>
    </div>
    
    <div class="svg-container">
      ${svg}
    </div>
    
    <div class="info">
      <strong>Theme:</strong> ${theme}<br>
      <strong>Generated:</strong> ${new Date().toISOString()}<br>
      <strong>Hash:</strong> ${sourceHash}${lastGanttLayoutMetrics ? `<br><br><strong>Layout Metrics (Pre-Render):</strong><br><pre style="font-size: 11px; overflow-x: auto; white-space: pre-wrap;">${escapeHtml(JSON.stringify(lastGanttLayoutMetrics, null, 2))}</pre>` : ''}
    </div>
  </div>
</body>
</html>`;

    // Write file
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    console.log(`[Mermaid Renderer] Saved HTML to: ${filePath}`);
  } catch (error) {
    console.error('[Mermaid Renderer] Failed to save HTML:', error instanceof Error ? error.message : error);
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function disposeMermaidRenderer(): void {
  // WebviewView is disposed automatically when the extension is deactivated
  decorationCache.clear();
  pendingRenders.clear();
  webviewView = undefined;
  resolveWebviewLoaded = undefined;
}
