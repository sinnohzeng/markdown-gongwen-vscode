import * as vscode from 'vscode';

type MermaidRenderOptions = {
  theme: 'default' | 'dark';
  fontFamily?: string;
};

let webviewView: vscode.WebviewView | undefined;
const pendingRequests = new Map<string, {
  resolve: (svg: string) => void;
  reject: (error: Error) => void;
}>();
let requestCounter = 0;
let isReady = false;
let readyPromise: Promise<void> | undefined;
let readyResolve: (() => void) | undefined;

function getWebviewContent(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    
    const vscode = acquireVsCodeApi();
    
    // Handle render requests
    window.addEventListener('message', async (event) => {
      const { id, source, theme, fontFamily } = event.data;
      
      if (!id || !source) return;
      
      try {
        // Initialize with the requested theme
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: theme || 'default',
          fontFamily: fontFamily || undefined,
        });
        
        // Create a container for rendering
        const container = document.createElement('div');
        container.id = 'mermaid-container-' + id;
        document.body.appendChild(container);
        
        const { svg } = await mermaid.render('mermaid-' + id, source);
        
        // Clean up
        container.remove();
        
        vscode.postMessage({ id, svg });
      } catch (error) {
        console.error('Mermaid render error:', error);
        vscode.postMessage({ id, error: error.message || 'Unknown error' });
      }
    });
    
    // Signal ready after mermaid is loaded
    console.log('Mermaid webview ready');
    vscode.postMessage({ ready: true });
  </script>
</head>
<body style="margin: 0; padding: 0;"></body>
</html>`;
}

class MermaidWebviewViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'mdInline.mermaidRenderer';

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = getWebviewContent();

    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.ready) {
        isReady = true;
        readyResolve?.();
        return;
      }

      const pending = pendingRequests.get(message.id);
      if (!pending) return;

      pendingRequests.delete(message.id);

      if (message.error) {
        pending.reject(new Error(message.error));
      } else {
        pending.resolve(message.svg);
      }
    });

    // Store reference
    setWebviewView(webviewView);
  }
}

function setWebviewView(view: vscode.WebviewView): void {
  webviewView = view;
}

let extensionContext: vscode.ExtensionContext | undefined;

export function initMermaidRenderer(context: vscode.ExtensionContext): void {
  extensionContext = context;

  // Register the webview view provider
  const provider = new MermaidWebviewViewProvider();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      MermaidWebviewViewProvider.viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // Initialize the ready promise
  readyPromise = new Promise((resolve) => {
    readyResolve = resolve;
  });

  // Open the mermaid view briefly to initialize it, then switch back to explorer
  // This is needed because the webview won't be created until it's visible
  vscode.commands.executeCommand('mdInline.mermaidRenderer.focus')
    .then(() => vscode.commands.executeCommand('workbench.view.explorer'));
}

async function ensureWebviewReady(): Promise<void> {
  if (isReady && webviewView) {
    return;
  }

  if (!readyPromise) {
    readyPromise = new Promise((resolve) => {
      readyResolve = resolve;
    });
  }

  // Try to focus the view to initialize it
  await vscode.commands.executeCommand('mdInline.mermaidRenderer.focus');

  // Wait for ready signal with timeout
  const timeout = new Promise<void>((_, reject) => {
    setTimeout(() => reject(new Error('Mermaid webview initialization timeout')), 10000);
  });

  await Promise.race([readyPromise, timeout]);
}

export async function renderMermaidSvg(source: string, options: MermaidRenderOptions): Promise<string> {
  if (!extensionContext) {
    throw new Error('Mermaid renderer not initialized. Call initMermaidRenderer first.');
  }

  await ensureWebviewReady();

  if (!webviewView) {
    throw new Error('Failed to create mermaid webview');
  }

  const id = String(++requestCounter);

  return new Promise((resolve, reject) => {
    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error('Mermaid render timeout'));
    }, 10000);

    pendingRequests.set(id, {
      resolve: (svg) => {
        clearTimeout(timeout);
        resolve(svg);
      },
      reject: (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    });

    webviewView!.webview.postMessage({
      id,
      source,
      theme: options.theme,
      fontFamily: options.fontFamily,
    });
  });
}

export function svgToDataUri(svg: string): string {
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export function disposeMermaidRenderer(): void {
  // WebviewView is disposed automatically when the extension is deactivated
  pendingRequests.clear();
  isReady = false;
  readyPromise = undefined;
  readyResolve = undefined;
}
