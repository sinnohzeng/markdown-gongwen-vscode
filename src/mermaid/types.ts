/**
 * Options for rendering Mermaid diagrams
 */
export type MermaidRenderOptions = {
  theme: 'default' | 'dark';
  fontFamily?: string;
  height?: number; // Height in pixels based on line count
  numLines?: number; // Number of lines in the code block
};

/**
 * Pending render request tracking
 */
export type PendingRender = {
  resolve: (svg: string) => void;
  reject: (error: Error) => void;
  timeoutId: NodeJS.Timeout;
};

/**
 * Message sent to webview for rendering
 */
export type RenderRequest = {
  source: string;
  darkMode: boolean;
  fontFamily?: string;
  requestId: string;
};

/**
 * Message received from webview
 */
export type RenderResponse = {
  svg?: string;
  error?: string;
  requestId?: string;
  ready?: boolean;
  /** Mermaid 脚本资源加载失败时由 webview 上报 */
  loadError?: string;
};
