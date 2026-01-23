import * as vscode from 'vscode';
import * as cheerio from 'cheerio';

type MermaidRenderOptions = {
  theme: 'default' | 'dark';
  fontFamily?: string;
  height?: number; // Height in pixels based on line count
};

let webviewView: vscode.WebviewView | undefined;
let webviewLoaded: Promise<void>;
let resolveWebviewLoaded: (() => void) | undefined;
let resolveSvg: ((svg: string) => void) | undefined;

// Memoization cache for decorations
const decorationCache = new Map<string, Promise<string>>();

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
    
    window.addEventListener('message', async (event) => {
      const data = event.data;
      
      if (!data || !data.source) {
        console.warn('[Mermaid Renderer] Invalid message received:', data);
        return;
      }
      
      console.log('[Mermaid Renderer] Received render request:', {
        sourceLength: data.source?.length || 0,
        sourcePreview: data.source?.substring(0, 100) + (data.source && data.source.length > 100 ? '...' : ''),
        darkMode: data.darkMode,
        fontFamily: data.fontFamily,
      });
      
      try {
        // Initialize Mermaid with theme and font settings
        mermaid.initialize({
          theme: data.darkMode ? 'dark' : 'default',
          fontFamily: data.fontFamily || undefined,
          startOnLoad: false,
          securityLevel: 'strict',
        });
        
        console.log('[Mermaid Renderer] Starting render...');
        // Render the diagram - Mermaid v11 returns { svg } from render()
        const { svg } = await mermaid.render('mermaid', data.source);
        
        console.log('[Mermaid Renderer] Render successful:', {
          svgLength: svg.length,
          svgPreview: svg.substring(0, 200) + (svg.length > 200 ? '...' : ''),
        });
        
        // Send SVG string back
        vscode.postMessage(svg);
      } catch (error) {
        console.error('[Mermaid Renderer] Render error:', {
          error: error.message || 'Unknown error',
          stack: error.stack,
          sourcePreview: data.source?.substring(0, 200) + (data.source && data.source.length > 200 ? '...' : ''),
        });
        // Send error message back
        vscode.postMessage({ error: error.message || 'Unknown error' });
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

      if (message && message.error) {
        console.error('[Mermaid Renderer] Render failed:', message.error);
        if (resolveSvg) {
          resolveSvg(`<svg><text>Error: ${message.error}</text></svg>`);
          resolveSvg = undefined;
        }
        return;
      }

      // Assume it's an SVG string
      if (typeof message === 'string' && resolveSvg) {
        console.log('[Mermaid Renderer] Received SVG:', {
          svgLength: message.length,
          svgPreview: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
        });
        resolveSvg(message);
        resolveSvg = undefined;
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

  // Create promise BEFORE posting message (like Markless pattern)
  // This ensures resolveSvg is set before the webview might respond
  return new Promise<string>((resolve, reject) => {
    if (!webviewView) {
      reject(new Error('Webview not available'));
      return;
    }
    
    resolveSvg = resolve;

    try {
      webviewView.webview.postMessage(data);
    } catch (error) {
      resolveSvg = undefined;
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
  
  // Return raw SVG without height processing
  return svgString;
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
  let originalHeight = parseFloat(svgNode.attr('height') || '0');
  let originalWidth = parseFloat(svgNode.attr('width') || '0');
  
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
  
  const originalMaxWidth = parseFloat(svgNode.css('max-width') || '0');
  
  // Calculate max-width based on desired height and original aspect ratio
  // Use width if max-width is not available
  const baseWidth = originalMaxWidth > 0 ? originalMaxWidth : originalWidth;
  const maxWidth = baseWidth > 0 && originalHeight > 0
    ? (baseWidth * height) / originalHeight
    : undefined;

  // Adjust SVG attributes
  if (maxWidth !== undefined) {
    svgNode.css('max-width', `${maxWidth}px`);
  }
  svgNode.attr('height', `${height}px`);
  svgNode.attr('preserveAspectRatio', 'xMinYMin meet');

  // Extract only the SVG element, not the full HTML document
  // Use toString() to get the SVG element with its attributes (like Markless)
  const processedSvg = svgNode.toString();
  
  console.log('[Mermaid Renderer] Processed SVG:', {
    originalHeight,
    originalWidth,
    newHeight: height,
    maxWidth,
    processedLength: processedSvg.length,
  });

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
  const processedSvg = processSvg(svgString, height);
  
  return processedSvg;
});

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

export function disposeMermaidRenderer(): void {
  // WebviewView is disposed automatically when the extension is deactivated
  decorationCache.clear();
  webviewView = undefined;
  resolveSvg = undefined;
  resolveWebviewLoaded = undefined;
}
