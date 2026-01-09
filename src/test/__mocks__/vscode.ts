// Mock VS Code API for testing
class MockRange {
  constructor(
    public start: { line: number; character: number },
    public end: { line: number; character: number }
  ) {}

  contains(position: { line: number; character: number }): boolean {
    return (
      (this.start.line < position.line ||
        (this.start.line === position.line && this.start.character <= position.character)) &&
      (this.end.line > position.line ||
        (this.end.line === position.line && this.end.character >= position.character))
    );
  }
  intersection(other: MockRange): MockRange | undefined {
    const start = {
      line: Math.max(this.start.line, other.start.line),
      character: Math.max(this.start.character, other.start.character),
    };
    const end = {
      line: Math.min(this.end.line, other.end.line),
      character: Math.min(this.end.character, other.end.character),
    };
    if (start.line > end.line || (start.line === end.line && start.character > end.character)) {
      return undefined;
    }
    return new MockRange(start, end);
  }
}

export const Range = MockRange as any;

class MockSelection extends MockRange {
  constructor(
    public anchor: { line: number; character: number },
    public active: { line: number; character: number }
  ) {
    super(anchor, active);
  }
  get isEmpty(): boolean {
    return (
      this.anchor.line === this.active.line && this.anchor.character === this.active.character
    );
  }
}

export const Selection = MockSelection as any;

export const Position = class {
  constructor(public line: number, public character: number) {}
};

export const Uri = {
  parse: (value: string) => {
    const schemeMatch = value.match(/^([^:]+):/);
    const scheme = schemeMatch ? schemeMatch[1] : 'file';
    return {
      toString: () => value,
      scheme: scheme,
    };
  },
  file: (path: string) => ({
    toString: () => `file://${path}`,
    scheme: 'file',
  }),
};

class MockTextDocument {
  constructor(
    public uri: ReturnType<typeof Uri.file>,
    public languageId: string,
    public version: number,
    public text: string
  ) {}

  getText(): string {
    return this.text;
  }
  positionAt(offset: number): { line: number; character: number } {
    // Handle CRLF correctly: split on \r\n first, then handle remaining \n and \r
    // This matches VS Code's behavior where \r\n is treated as a single line break
    const textBeforeOffset = this.text.substring(0, offset);
    
    // Count lines by splitting on \r\n (CRLF), then on \n (LF), then on \r (CR)
    // This ensures CRLF is treated as a single line break
    let line = 0;
    let character = 0;
    let i = 0;
    
    while (i < textBeforeOffset.length) {
      // Check for CRLF first (Windows line ending)
      if (i + 1 < textBeforeOffset.length && 
          textBeforeOffset[i] === '\r' && 
          textBeforeOffset[i + 1] === '\n') {
        line++;
        character = 0;
        i += 2; // Skip both \r and \n
      } 
      // Check for LF (Unix line ending)
      else if (textBeforeOffset[i] === '\n') {
        line++;
        character = 0;
        i++;
      }
      // Check for CR (old Mac line ending)
      else if (textBeforeOffset[i] === '\r') {
        line++;
        character = 0;
        i++;
      }
      // Regular character
      else {
        character++;
        i++;
      }
    }
    
    return {
      line,
      character,
    };
  }
}

export const TextDocument = MockTextDocument as any;

class MockTextEditor {
  constructor(
    public document: MockTextDocument,
    public selections: MockSelection[]
  ) {}

  setDecorations(_decorationType: any, _ranges: MockRange[]): void {
    // Mock implementation
  }
}

export const TextEditor = MockTextEditor as any;

export const window = {
  createTextEditorDecorationType: (_options: any) => ({}),
  activeTextEditor: undefined as any,
  onDidChangeActiveTextEditor: () => ({ dispose: () => {} }),
  onDidChangeTextEditorSelection: () => ({ dispose: () => {} }),
};

export const workspace = {
  onDidChangeTextDocument: () => ({ dispose: () => {} }),
};

export const ExtensionContext = class {
  subscriptions: Array<{ dispose: () => void }> = [];
};

export const ThemeColor = class {
  constructor(public id: string) {}
};

