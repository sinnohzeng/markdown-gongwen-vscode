import { Range, TextEditor, TextDocument, TextDocumentChangeEvent, workspace, window, Position, WorkspaceEdit, Selection, TextEditorSelectionChangeKind, TextEditorDecorationType } from 'vscode';
import {
  HideDecorationType,
  TransparentDecorationType,
  GhostFaintDecorationType,
  BoldDecorationType,
  ItalicDecorationType,
  BoldItalicDecorationType,
  StrikethroughDecorationType,
  CodeDecorationType,
  CodeBlockDecorationType,
  CodeBlockLanguageDecorationType,
  HeadingDecorationType,
  Heading1DecorationType,
  Heading2DecorationType,
  Heading3DecorationType,
  Heading4DecorationType,
  Heading5DecorationType,
  Heading6DecorationType,
  LinkDecorationType,
  ImageDecorationType,
  BlockquoteDecorationType,
  ListItemDecorationType,
  OrderedListItemDecorationType,
  HorizontalRuleDecorationType,
  CheckboxUncheckedDecorationType,
  CheckboxCheckedDecorationType,
  FrontmatterDecorationType,
  FrontmatterDelimiterDecorationType,
} from './decorations';
import { MarkdownParser, DecorationRange, DecorationType, ScopeRange } from './parser';
import { mapNormalizedToOriginal } from './position-mapping';
import { isMarkerDecorationType } from './decorator/decoration-categories';

/**
 * Performance and caching constants.
 */
const PERFORMANCE_CONSTANTS = {
  /** Maximum number of documents to cache (LRU eviction) */
  MAX_CACHE_SIZE: 10,
  /** Debounce timeout for document changes (ms) - balances responsiveness vs performance */
  DEBOUNCE_TIMEOUT_MS: 150,
  /** Maximum timeout for requestIdleCallback (ms) - ensures updates don't wait indefinitely */
  IDLE_CALLBACK_TIMEOUT_MS: 300,
} as const;

/**
 * Cache entry for document decorations.
 */
interface CacheEntry {
  version: number;
  decorations: DecorationRange[];
  scopes: ScopeEntry[];
  text: string;
  lastAccessed: number;
}

/**
 * Represents a markdown construct scope (e.g., bold, italic, link).
 * The scope spans from the start of the opening marker to the end of the closing marker.
 */
interface ScopeEntry {
  startPos: number;
  endPos: number;
  range: Range;
}

/**
 * Manages the application of text decorations to markdown documents in VS Code.
 * 
 * This class orchestrates the parsing of markdown content and applies visual
 * decorations (bold, italic, headings, etc.) directly in the editor. It also
 * handles showing raw markdown syntax when text is selected.
 * 
 * @class Decorator
 * @example
 * const decorator = new Decorator();
 * decorator.setActiveEditor(vscode.window.activeTextEditor);
 * // Decorations are automatically updated when the editor content changes
 */
export class Decorator {
  /** The currently active text editor being decorated */
  activeEditor: TextEditor | undefined;

  private parser = new MarkdownParser();
  private updateTimeout: NodeJS.Timeout | undefined;

  /** Cache for parsed decorations, keyed by document URI */
  private decorationCache = new Map<string, CacheEntry>();

  /** Maximum number of documents to cache (LRU eviction) */
  private readonly maxCacheSize = PERFORMANCE_CONSTANTS.MAX_CACHE_SIZE;

  /** Access counter for LRU eviction */
  private accessCounter = 0;

  /** Pending update batching: track last document version that triggered an update */
  private pendingUpdateVersion = new Map<string, number>();

  /** requestIdleCallback handle for idle updates */
  private idleCallbackHandle: number | undefined;

  /** Whether decorations are enabled or disabled */
  private decorationsEnabled = true;

  /** Whether to skip decorations in diff views (inverse of applyDecorations setting) */
  private skipDecorationsInDiffView = true;

  private hideDecorationType = HideDecorationType();
  private transparentDecorationType = TransparentDecorationType();
  private ghostFaintDecorationType = GhostFaintDecorationType(this.getGhostFaintOpacity());
  private boldDecorationType = BoldDecorationType();
  private italicDecorationType = ItalicDecorationType();
  private boldItalicDecorationType = BoldItalicDecorationType();
  private strikethroughDecorationType = StrikethroughDecorationType();
  private codeDecorationType = CodeDecorationType();
  private codeBlockDecorationType = CodeBlockDecorationType();
  private codeBlockLanguageDecorationType = CodeBlockLanguageDecorationType(this.getCodeBlockLanguageOpacity());
  private headingDecorationType = HeadingDecorationType();
  private heading1DecorationType = Heading1DecorationType();
  private heading2DecorationType = Heading2DecorationType();
  private heading3DecorationType = Heading3DecorationType();
  private heading4DecorationType = Heading4DecorationType();
  private heading5DecorationType = Heading5DecorationType();
  private heading6DecorationType = Heading6DecorationType();
  private linkDecorationType = LinkDecorationType();
  private imageDecorationType = ImageDecorationType();
  private blockquoteDecorationType = BlockquoteDecorationType();
  private listItemDecorationType = ListItemDecorationType();
  private orderedListItemDecorationType = OrderedListItemDecorationType();
  private horizontalRuleDecorationType = HorizontalRuleDecorationType();
  private checkboxUncheckedDecorationType = CheckboxUncheckedDecorationType();
  private checkboxCheckedDecorationType = CheckboxCheckedDecorationType();
  private frontmatterDecorationType = FrontmatterDecorationType();
  private frontmatterDelimiterDecorationType = FrontmatterDelimiterDecorationType(this.getFrontmatterDelimiterOpacity());

  /**
   * Sets the active text editor and immediately updates decorations.
   * 
   * This should be called when switching between editors or when a new
   * markdown file is opened. The decorations will be applied to the new editor.
   * 
   * @param {TextEditor | undefined} textEditor - The text editor to decorate, or undefined to clear
   * 
   * @example
   * decorator.setActiveEditor(vscode.window.activeTextEditor);
   */
  setActiveEditor(textEditor: TextEditor | undefined) {
    // Clear any pending debounced updates
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = undefined;
    }

    if (!textEditor) {
      return;
    }

    this.activeEditor = textEditor;

    // Update immediately when switching editors (no debounce)
    this.updateDecorationsForSelection();
  }

  /**
   * Updates decorations for selection changes (immediate, no debounce).
   *
   * This method is optimized for selection changes where the document content
   * hasn't changed. It uses cached decorations and only re-filters based on
   * the new selection.
   *
   * Also handles checkbox toggle when clicking inside [ ] or [x].
   *
   * @param kind - The kind of selection change (Mouse, Keyboard, or Command)
   * @example
   * decorator.updateDecorationsForSelection(TextEditorSelectionChangeKind.Mouse);
   */
  updateDecorationsForSelection(kind?: TextEditorSelectionChangeKind) {
    // Early exit for non-markdown files
    if (!this.activeEditor || !this.isMarkdownDocument()) {
      return;
    }

    // Check for checkbox click (single cursor, no selection)
    // If checkbox was toggled, skip decoration update to avoid flicker
    if (kind === TextEditorSelectionChangeKind.Mouse && this.handleCheckboxClick()) {
      return;
    }

    // Immediate update without debounce for selection changes
    this.updateDecorationsInternal();
  }

  /**
   * Handles checkbox toggle when user clicks inside [ ] or [x].
   * Detects if cursor is positioned inside a checkbox and toggles it.
   *
   * @returns true if a checkbox was toggled, false otherwise
   */
  private handleCheckboxClick(): boolean {
    if (!this.activeEditor) return false;

    const selection = this.activeEditor.selection;

    // Only handle single cursor clicks (no selection range)
    if (!selection.isEmpty) return false;

    const document = this.activeEditor.document;
    const line = document.lineAt(selection.active.line);
    const cursorChar = selection.active.character;

    // Find checkbox pattern on this line: [ ] or [x] or [X]
    const checkboxRegex = /\[([ xX])\]/g;
    let match: RegExpExecArray | null;

    while ((match = checkboxRegex.exec(line.text)) !== null) {
      const bracketStart = match.index;
      const bracketEnd = match.index + 3; // [ ] is 3 chars

      // Check if cursor is on or inside the checkbox [ ] range
      // Include bracketStart because clicking the ☐ decoration lands cursor there
      if (cursorChar >= bracketStart && cursorChar <= bracketEnd) {
        const currentState = match[1];
        const newState = currentState === ' ' ? 'x' : ' ';

        // Toggle the checkbox
        const edit = new WorkspaceEdit();
        const charPosition = new Position(selection.active.line, bracketStart + 1);
        edit.replace(
          document.uri,
          new Range(charPosition, charPosition.translate(0, 1)),
          newState
        );

        workspace.applyEdit(edit);

        // Move cursor after the checkbox to avoid re-triggering
        const newCursorPos = new Position(selection.active.line, bracketEnd + 1);
        this.activeEditor.selection = new Selection(newCursorPos, newCursorPos);

        return true;
      }
    }
    return false;
  }

  /**
   * Updates decorations for document changes (debounced with batching).
   * 
   * This method handles document content changes and uses smart debouncing to prevent
   * excessive parsing during rapid typing. It batches multiple changes and uses
   * requestIdleCallback when available for non-urgent updates.
   * 
   * @param {TextDocumentChangeEvent} event - The document change event (optional)
   * 
   * @example
   * decorator.updateDecorationsForDocument(event);
   */
  updateDecorationsForDocument(event?: TextDocumentChangeEvent) {
    // Early exit for non-markdown files (before any work)
    if (!this.activeEditor || !this.isMarkdownDocument()) {
      return;
    }

    const document = event?.document || this.activeEditor.document;
    const cacheKey = document.uri.toString();

    // Invalidate cache on document change
    if (event) {
      this.invalidateCache(document);
    }

    // Track this version to batch updates
    this.pendingUpdateVersion.set(cacheKey, document.version);

    // Clear any pending timeout-based updates
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = undefined;
    }

    // Cancel any pending idle callback
    if (this.idleCallbackHandle !== undefined) {
      this.cancelIdleCallback(this.idleCallbackHandle);
      this.idleCallbackHandle = undefined;
    }

    // Debounce with two-tier strategy:
    // 1. Short timeout for responsive feedback
    // 2. Fallback to idle callback for heavy work during continuous typing
    this.updateTimeout = setTimeout(() => {
      this.updateTimeout = undefined;

      // Check if document version changed since we scheduled this update (batching)
      const latestVersion = this.activeEditor?.document.version;
      const scheduledVersion = this.pendingUpdateVersion.get(cacheKey);

      if (latestVersion !== undefined && scheduledVersion !== undefined && latestVersion !== scheduledVersion) {
        // Document changed again, skip this update (another one is queued)
        return;
      }

      // Use requestIdleCallback wrapper for non-urgent updates
      // This will use requestIdleCallback in browser or setTimeout in Node.js
      this.idleCallbackHandle = this.requestIdleCallback(() => {
        this.idleCallbackHandle = undefined;
        this.updateDecorationsInternal();
        this.pendingUpdateVersion.delete(cacheKey);
      }, { timeout: PERFORMANCE_CONSTANTS.IDLE_CALLBACK_TIMEOUT_MS });
    }, PERFORMANCE_CONSTANTS.DEBOUNCE_TIMEOUT_MS);
  }

  /**
   * Legacy method for backward compatibility.
   * Delegates to updateDecorationsForSelection() for immediate updates.
   * 
   * @deprecated Use updateDecorationsForSelection() or updateDecorationsForDocument() instead
   * @param {boolean} immediate - If true, update immediately
   */
  updateDecorations(immediate: boolean = false) {
    if (immediate) {
      this.updateDecorationsForSelection();
    } else {
      this.updateDecorationsForDocument();
    }
  }

  /**
   * Toggle decorations on/off.
   * 
   * @returns {boolean} The new state (true = enabled, false = disabled)
   */
  toggleDecorations(): boolean {
    this.decorationsEnabled = !this.decorationsEnabled;

    if (this.decorationsEnabled) {
      // Re-enable: update decorations immediately
      this.updateDecorationsForSelection();
    } else {
      // Disable: clear all decorations
      this.clearAllDecorations();
    }

    return this.decorationsEnabled;
  }

  /**
   * Check if decorations are currently enabled.
   * 
   * @returns {boolean} True if decorations are enabled
   */
  isEnabled(): boolean {
    return this.decorationsEnabled;
  }

  /**
   * Updates the diff view decoration setting.
   * 
   * @param {boolean} skipDecorations - True to skip decorations in diff views (show raw markdown)
   */
  updateDiffViewDecorationSetting(skipDecorations: boolean): void {
    this.skipDecorationsInDiffView = skipDecorations;
  }

  /**
   * Clear all decorations from the active editor.
   * 
   * @private
   */
  private clearAllDecorations(): void {
    if (!this.activeEditor) {
      return;
    }

    // Set all decoration types to empty arrays
    for (const decorationType of this.decorationTypeMap.values()) {
      this.activeEditor.setDecorations(decorationType, []);
    }
    
    // Also clear ghost faint decoration (not in decorationTypeMap)
    this.activeEditor.setDecorations(this.ghostFaintDecorationType, []);
  }

  /**
   * Internal method that performs the actual decoration update.
   * This orchestrates parsing, filtering, and application.
   */
  private updateDecorationsInternal() {
    if (!this.activeEditor) {
      return;
    }

    // Early exit if decorations are disabled
    if (!this.decorationsEnabled) {
      return;
    }

    // Early exit for non-markdown files
    if (!this.isMarkdownDocument()) {
      return;
    }

    // Check if we should skip decorations in diff mode
    if (this.skipDecorationsInDiffView && this.isDiffEditor()) {
      this.clearAllDecorations();
      return;
    }

    const document = this.activeEditor.document;

    // Parse document (uses cache if version unchanged)
    const { decorations, scopes } = this.parseDocument(document);

    // Re-validate version before applying (race condition protection)
    if (this.isDocumentStale(document)) {
      return; // Document changed during parse, skip this update
    }

    // Get original document text for offset adjustment (use cached if available for consistency)
    const cacheKey = document.uri.toString();
    const cached = this.decorationCache.get(cacheKey);
    const originalText = cached?.text || document.getText();

    // Filter decorations based on selections (pass original text for offset adjustment)
    const filtered = this.filterDecorations(decorations, scopes, originalText);

    // Apply decorations
    this.applyDecorations(filtered);
  }

  /**
   * Checks if the document is a markdown file.
   * 
   * @private
   * @returns {boolean} True if document is markdown
   */
  private isMarkdownDocument(): boolean {
    if (!this.activeEditor) {
      return false;
    }
    return ['markdown', 'md', 'mdx'].includes(this.activeEditor.document.languageId);
  }

  /** URI schemes that indicate a diff view context */
  private static readonly DIFF_SCHEMES: readonly string[] = ['git', 'vscode-merge', 'vscode-diff'];

  /**
   * Checks if a specific editor is in a diff context based on its URI.
   * 
   * @private
   * @param {TextEditor} editor - The editor to check
   * @returns {boolean} True if the editor is in a diff context
   */
  private isEditorInDiffContext(editor: TextEditor): boolean {
    const uri = editor.document.uri;
    const scheme = uri.scheme;
    const uriString = uri.toString();
    
    // Check for known diff-related schemes
    if (Decorator.DIFF_SCHEMES.includes(scheme)) {
      return true;
    }

    // Check URI string for diff-related patterns
    const uriLower = uriString.toLowerCase();
    if (uriLower.includes('diff') || uriLower.includes('merge') || 
        uriLower.includes('compare')) {
      return true;
    }

    // Check URI query parameters
    if (uri.query) {
      const query = uri.query.toLowerCase();
      if (query.includes('diff') || query.includes('merge') || 
          query.includes('compare') || query.includes('path=')) {
        return true;
      }
    }

    // Check URI fragment
    if (uri.fragment) {
      const fragment = uri.fragment.toLowerCase();
      if (fragment.includes('diff') || fragment.includes('merge')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Detects if the current editor is viewing a diff.
   * 
   * For side-by-side diff views, checks ALL visible editors to see if any
   * are in a diff context. This ensures both sides of the diff have
   * decorations disabled, regardless of which side is currently active.
   * 
   * @private
   * @returns {boolean} True if editor is in diff mode
   */
  private isDiffEditor(): boolean {
    if (!this.activeEditor) {
      return false;
    }

    // Check the active editor first
    if (this.isEditorInDiffContext(this.activeEditor)) {
      return true;
    }

    // For side-by-side diff views, check all visible editors
    // If ANY visible editor is in a diff context, we're in a diff view
    // This ensures both sides of the diff have decorations disabled
    const visibleEditors = window.visibleTextEditors;
    for (const editor of visibleEditors) {
      if (this.isEditorInDiffContext(editor)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if document version has changed since cache was created (stale check).
   * 
   * @private
   * @param {TextDocument} document - The document to check
   * @returns {boolean} True if document is stale
   */
  private isDocumentStale(document: TextDocument): boolean {
    const cacheKey = document.uri.toString();
    const cached = this.decorationCache.get(cacheKey);
    if (!cached) {
      return false; // No cache, not stale
    }
    return cached.version !== document.version;
  }

  /**
   * Parses the document and returns decoration ranges and scopes.
   * Uses cache if document version is unchanged.
   * 
   * @private
   * @param {TextDocument} document - The document to parse
   * @returns Parsed decorations and scopes
   */
  private parseDocument(document: TextDocument): { decorations: DecorationRange[]; scopes: ScopeEntry[] } {
    const cacheKey = document.uri.toString();
    const cached = this.getCachedDecorations(document);

    if (cached !== null) {
      // Update access time for LRU
      const entry = this.decorationCache.get(cacheKey);
      if (entry) {
        entry.lastAccessed = ++this.accessCounter;
      }
      return { decorations: cached.decorations, scopes: cached.scopes };
    }

    // Parse document
    const documentText = document.getText();
    const { decorations, scopes } = this.parser.extractDecorationsWithScopes(documentText);
    const scopeEntries = this.buildScopeEntries(scopes, documentText);

    // Cache the result
    this.setCachedDecorations(document, decorations, scopeEntries, documentText);

    return { decorations, scopes: scopeEntries };
  }

  /**
   * Builds scope entries from parser-emitted scope ranges.
   */
  private buildScopeEntries(scopes: ScopeRange[], originalText: string): ScopeEntry[] {
    if (!this.activeEditor || scopes.length === 0) {
      return [];
    }

    const entries: ScopeEntry[] = [];
    for (const scope of scopes) {
      const range = this.createRange(scope.startPos, scope.endPos, originalText);
      if (range) {
        entries.push({
          startPos: scope.startPos,
          endPos: scope.endPos,
          range,
        });
      }
    }

    return entries;
  }

  /**
   * Collects raw ranges from selections.
   * Returns all scopes that intersect with any selection range.
   * 
   * @private
   * @param {Range[]} selectedRanges - Non-empty selection ranges
   * @param {ScopeEntry[]} scopes - All scope entries
   * @returns {Range[]} Ranges that should show raw markdown
   */
  private collectRawRanges(selectedRanges: Range[], scopes: ScopeEntry[]): Range[] {
    if (!this.activeEditor || selectedRanges.length === 0 || scopes.length === 0) {
      return [];
    }

    const rawRanges: Range[] = [];
    for (const selection of selectedRanges) {
      for (const scope of scopes) {
        const intersection = selection.intersection(scope.range);
        if (intersection !== undefined) {
          rawRanges.push(scope.range);
        }
      }
    }

    return rawRanges;
  }

  /**
   * Collects cursor scope ranges.
   * Returns the smallest scope containing each cursor position.
   * 
   * Includes boundary positions (start and end) so that cursors directly at
   * the construct boundaries show raw state instead of ghost state.
   * 
   * @private
   * @param {Position[]} cursorPositions - Cursor positions (empty selections)
   * @param {ScopeEntry[]} scopes - All scope entries
   * @returns {Range[]} Ranges that should show raw markdown
   */
  private collectCursorScopeRanges(cursorPositions: Position[], scopes: ScopeEntry[]): Range[] {
    if (!this.activeEditor || cursorPositions.length === 0 || scopes.length === 0) {
      return [];
    }

    const cursorRanges: Range[] = [];
    for (const position of cursorPositions) {
      // Check if cursor is inside scope or at its boundaries (start or end)
      // Range.contains() uses exclusive end, so we also check if position equals start or end
      const matchingScopes = scopes.filter((scope) => {
        const isInside = scope.range.contains(position);
        const isAtStart = position.line === scope.range.start.line && 
                          position.character === scope.range.start.character;
        const isAtEnd = position.line === scope.range.end.line && 
                        position.character === scope.range.end.character;
        return isInside || isAtStart || isAtEnd;
      });
      
      if (matchingScopes.length === 0) {
        continue;
      }

      const smallestScope = matchingScopes.reduce((smallest, scope) => {
        if (!smallest) {
          return scope;
        }
        const smallestLength = smallest.endPos - smallest.startPos;
        const scopeLength = scope.endPos - scope.startPos;
        return scopeLength < smallestLength ? scope : smallest;
      }, undefined as ScopeEntry | undefined);

      if (smallestScope) {
        cursorRanges.push(smallestScope.range);
      }
    }

    return cursorRanges;
  }

  /**
   * Merges overlapping ranges into a single array of non-overlapping ranges.
   * 
   * @private
   * @param {Range[]} ranges - Ranges to merge
   * @returns {Range[]} Merged ranges
   */
  private mergeRanges(ranges: Range[]): Range[] {
    if (ranges.length === 0) {
      return [];
    }

    const sorted = [...ranges].sort((a, b) => {
      if (a.start.line !== b.start.line) {
        return a.start.line - b.start.line;
      }
      return a.start.character - b.start.character;
    });

    const merged: Range[] = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const last = merged[merged.length - 1];

      if (current.start.isBeforeOrEqual(last.end) && current.end.isAfterOrEqual(last.start)) {
        merged[merged.length - 1] = new Range(
          last.start,
          current.end.isAfter(last.end) ? current.end : last.end
        );
      } else {
        merged.push(current);
      }
    }

    return merged;
  }

  /**
   * Checks if a range intersects with any of the given ranges.
   * 
   * @private
   * @param {Range} range - Range to check
   * @param {Range[]} ranges - Ranges to check against
   * @returns {boolean} True if range intersects with any of the given ranges
   */
  private rangeIntersectsAny(range: Range, ranges: Range[]): boolean {
    return ranges.some((candidate) => {
      const intersection = range.intersection(candidate);
      return intersection !== undefined;
    });
  }

  /**
   * Filters decorations based on current selections and groups by type.
   * Implements 3-state model: Rendered (default), Ghost (cursor on line), Raw (cursor/selection in scope).
   * 
   * @private
   * @param {DecorationRange[]} decorations - Decorations to filter
   * @param {string} originalText - Original document text (for offset adjustment)
   * @returns {Map<DecorationType, Range[]>} Filtered decorations grouped by type
   */
  private filterDecorations(
    decorations: DecorationRange[],
    scopes: ScopeEntry[],
    originalText: string
  ): Map<DecorationType, Range[]> {
    if (!this.activeEditor) {
      return new Map();
    }

    const selectedRanges: Range[] = [];
    const cursorPositions: Position[] = [];
    const activeLines = new Set<number>(); // Lines with selections or cursors

    for (const selection of this.activeEditor.selections) {
      if (!selection.isEmpty) {
        selectedRanges.push(selection);
        // Add all lines in the selection to activeLines
        for (let line = selection.start.line; line <= selection.end.line; line++) {
          activeLines.add(line);
        }
      } else {
        cursorPositions.push(selection.start);
        activeLines.add(selection.start.line);
      }
    }

    const rawRanges = this.mergeRanges([
      ...this.collectRawRanges(selectedRanges, scopes),
      ...this.collectCursorScopeRanges(cursorPositions, scopes),
    ]);

    const selectionOnlyMarkerTypes = new Set<DecorationType>([
      'blockquote',
      'listItem',
      'checkboxUnchecked',
      'checkboxChecked',
    ]);
    const headingTypes = new Set<DecorationType>([
      'heading',
      'heading1',
      'heading2',
      'heading3',
      'heading4',
      'heading5',
      'heading6',
    ]);
    const headingMarkerEndPositions = new Set<number>();
    for (const decoration of decorations) {
      if (headingTypes.has(decoration.type)) {
        headingMarkerEndPositions.add(decoration.startPos);
      }
    }

    const filtered = new Map<DecorationType, Range[]>();
    const ghostFaintRanges: Range[] = [];

    const selectionOrCursorOverlaps = (range: Range): boolean => {
      const selectionOverlaps = selectedRanges.some((selection) => {
        const intersection = range.intersection(selection);
        return intersection !== undefined;
      });
      if (selectionOverlaps) {
        return true;
      }
      return cursorPositions.some((position) => range.contains(position));
    };

    for (const decoration of decorations) {
      const range = this.createRange(decoration.startPos, decoration.endPos, originalText);
      if (!range) continue;
      const isActiveLine = activeLines.size > 0 && activeLines.has(range.start.line);

      // Code blocks and frontmatter use full-line background decorations.
      // When we enter Raw state (cursor/selection intersects the scope),
      // keeping those opaque backgrounds can make VS Code's native selection highlight
      // appear invisible. In Raw state we prefer the unstyled editor surface anyway,
      // so we suppress these background decorations.
      if (decoration.type === 'codeBlock' || decoration.type === 'frontmatter') {
        const intersectsRaw = this.rangeIntersectsAny(range, rawRanges);
        if (intersectsRaw) {
          continue;
        }
      }

      if (selectionOnlyMarkerTypes.has(decoration.type)) {
        if (selectionOrCursorOverlaps(range)) {
          // Raw state: show actual marker characters
          continue;
        }
        // Rendered state: apply marker decorations even on active lines
        const ranges = filtered.get(decoration.type) || [];
        ranges.push(range);
        filtered.set(decoration.type, ranges);
        continue;
      }

      if (headingTypes.has(decoration.type) && isActiveLine) {
        // Show raw heading text (no heading styling) on active lines
        continue;
      }
      
      if (decoration.type === 'hide' || decoration.type === 'transparent') {
        const intersectsRaw = this.rangeIntersectsAny(range, rawRanges);
        const isHeadingMarkerHide = decoration.type === 'hide' &&
          headingMarkerEndPositions.has(decoration.endPos);

        if (intersectsRaw) {
          // Raw state: skip (show actual syntax)
          continue;
        }
        if (isHeadingMarkerHide && isActiveLine) {
          // Show heading markers on active lines
          continue;
        }
        if (isActiveLine) {
          // Ghost state: show faint markers on active lines
          ghostFaintRanges.push(range);
          continue;
        }
        // Rendered state: hide markers normally
        const ranges = filtered.get(decoration.type) || [];
        ranges.push(range);
        filtered.set(decoration.type, ranges);
        continue;
      }

      if (isMarkerDecorationType(decoration.type)) {
        const intersectsRaw = this.rangeIntersectsAny(range, rawRanges);

        if (intersectsRaw) {
          // Raw state: skip marker decorations (show actual syntax)
          continue;
        }
        if (isActiveLine) {
          // Ghost state: show faint markers on active lines
          ghostFaintRanges.push(range);
          continue;
        }
        // Rendered state: apply marker decorations normally
      }

      // Add to appropriate type array
      const ranges = filtered.get(decoration.type) || [];
      ranges.push(range);
      filtered.set(decoration.type, ranges);
    }

    if (ghostFaintRanges.length > 0) {
      filtered.set('ghostFaint' as DecorationType, ghostFaintRanges);
    }

    return filtered;
  }

  /** Mapping of decoration types to their VS Code decoration instances */
  private decorationTypeMap = new Map<DecorationType, TextEditorDecorationType>([
    ['hide', this.hideDecorationType],
    ['transparent', this.transparentDecorationType],
    ['bold', this.boldDecorationType],
    ['italic', this.italicDecorationType],
    ['boldItalic', this.boldItalicDecorationType],
    ['strikethrough', this.strikethroughDecorationType],
    ['code', this.codeDecorationType],
    ['codeBlock', this.codeBlockDecorationType],
    ['codeBlockLanguage', this.codeBlockLanguageDecorationType],
    ['heading', this.headingDecorationType],
    ['heading1', this.heading1DecorationType],
    ['heading2', this.heading2DecorationType],
    ['heading3', this.heading3DecorationType],
    ['heading4', this.heading4DecorationType],
    ['heading5', this.heading5DecorationType],
    ['heading6', this.heading6DecorationType],
    ['link', this.linkDecorationType],
    ['image', this.imageDecorationType],
    ['blockquote', this.blockquoteDecorationType],
    ['listItem', this.listItemDecorationType],
    ['orderedListItem', this.orderedListItemDecorationType],
    ['horizontalRule', this.horizontalRuleDecorationType],
    ['checkboxUnchecked', this.checkboxUncheckedDecorationType],
    ['checkboxChecked', this.checkboxCheckedDecorationType],
    ['frontmatter', this.frontmatterDecorationType],
    ['frontmatterDelimiter', this.frontmatterDelimiterDecorationType],
  ]);

  /**
   * Applies filtered decorations to the editor.
   * 
   * @private
   * @param {Map<DecorationType, Range[]>} filteredDecorations - Decorations grouped by type
   */
  private applyDecorations(filteredDecorations: Map<DecorationType, Range[]>) {
    if (!this.activeEditor) {
      return;
    }

    // Apply all decorations by iterating through the type map
    for (const [type, decorationType] of this.decorationTypeMap.entries()) {
      this.activeEditor.setDecorations(decorationType, filteredDecorations.get(type) || []);
    }

    const ghostFaintRanges = filteredDecorations.get('ghostFaint' as DecorationType) || [];
    this.activeEditor.setDecorations(this.ghostFaintDecorationType, ghostFaintRanges);
  }

  /**
   * Gets cached decorations for a document if version matches.
   * 
   * @private
   * @param {TextDocument} document - The document to get cache for
   * @returns {CacheEntry | null} Cached entry or null if cache miss/version mismatch
   */
  private getCachedDecorations(document: TextDocument): CacheEntry | null {
    const cacheKey = document.uri.toString();
    const cached = this.decorationCache.get(cacheKey);

    if (!cached) {
      return null;
    }

    // Check version match
    if (cached.version !== document.version) {
      return null;
    }

    return cached;
  }

  /**
   * Sets cached decorations for a document.
   * Implements LRU eviction if cache is full.
   * 
   * @private
   * @param {TextDocument} document - The document to cache
   * @param {DecorationRange[]} decorations - Decorations to cache
   * @param {ScopeEntry[]} scopes - Scope entries to cache
   * @param {string} text - Document text to cache
   */
  private setCachedDecorations(
    document: TextDocument,
    decorations: DecorationRange[],
    scopes: ScopeEntry[],
    text: string
  ): void {
    const cacheKey = document.uri.toString();

    // Evict least recently used if cache is full
    if (this.decorationCache.size >= this.maxCacheSize && !this.decorationCache.has(cacheKey)) {
      this.evictLRU();
    }

    this.decorationCache.set(cacheKey, {
      version: document.version,
      decorations,
      scopes,
      text,
      lastAccessed: ++this.accessCounter,
    });
  }

  /**
   * Evicts the least recently used cache entry.
   * 
   * @private
   */
  private evictLRU(): void {
    let lruKey: string | undefined;
    let lruAccess = Infinity;

    for (const [key, entry] of this.decorationCache.entries()) {
      if (entry.lastAccessed < lruAccess) {
        lruAccess = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.decorationCache.delete(lruKey);
    }
  }

  /**
   * Invalidates cache for a document.
   * 
   * @private
   * @param {TextDocument} document - The document to invalidate
   */
  private invalidateCache(document: TextDocument): void {
    const cacheKey = document.uri.toString();
    this.decorationCache.delete(cacheKey);
  }

  /**
   * Clears cache for a specific document or all documents.
   * 
   * @param {string} documentUri - Optional document URI to clear, or undefined to clear all
   */
  clearCache(documentUri?: string): void {
    if (documentUri) {
      this.decorationCache.delete(documentUri);
    } else {
      this.decorationCache.clear();
    }
  }

  /**
   * Handles document change events with change tracking.
   * 
   * @param {TextDocumentChangeEvent} event - The document change event
   */
  updateDecorationsFromChange(event: TextDocumentChangeEvent): void {
    // For now, always invalidate cache and do full parse
    // Future: could use calculateChangeSize to determine if incremental parsing is feasible
    this.invalidateCache(event.document);

    // Update decorations with debounce
    this.updateDecorationsForDocument(event);
  }

  /**
   * Calculates the percentage of document changed.
   * 
   * @private
   * @param {TextDocumentChangeEvent} event - The document change event
   * @returns {number} Percentage of document changed (0-100)
   */
  private calculateChangeSize(event: TextDocumentChangeEvent): number {
    const document = event.document;
    const totalLength = document.getText().length;

    if (totalLength === 0) {
      return 0;
    }

    let changedLength = 0;
    for (const change of event.contentChanges) {
      const deletedLength = change.rangeLength;
      const insertedLength = change.text.length;
      changedLength += Math.max(deletedLength, insertedLength);
    }

    return (changedLength / totalLength) * 100;
  }


  /**
   * Recreates the code decoration type when theme changes.
   * This ensures the background color adapts to the new theme.
   */
  /**
   * Gets the ghost faint opacity from configuration.
   * 
   * @private
   * @returns {number} Opacity value between 0.0 and 1.0
   */
  private getGhostFaintOpacity(): number {
    const config = workspace.getConfiguration('markdownInlineEditor');
    return config.get<number>('decorations.ghostFaintOpacity', 0.3);
  }

  /**
   * Gets the frontmatter delimiter opacity from configuration.
   * 
   * @private
   * @returns {number} Opacity value between 0.0 and 1.0
   */
  private getFrontmatterDelimiterOpacity(): number {
    const config = workspace.getConfiguration('markdownInlineEditor');
    return config.get<number>('decorations.frontmatterDelimiterOpacity', 0.3);
  }

  /**
   * Gets the code block language opacity from configuration.
   * 
   * @private
   * @returns {number} Opacity value between 0.0 and 1.0
   */
  private getCodeBlockLanguageOpacity(): number {
    const config = workspace.getConfiguration('markdownInlineEditor');
    return config.get<number>('decorations.codeBlockLanguageOpacity', 0.3);
  }

  recreateCodeDecorationType(): void {
    // Dispose the old decoration type
    this.codeDecorationType.dispose();
    
    // Create a new decoration type with updated theme colors
    this.codeDecorationType = CodeDecorationType();
    
    // Update the decoration type map
    this.decorationTypeMap.set('code', this.codeDecorationType);
    
    // Reapply decorations with the new decoration type
    if (this.activeEditor && this.isMarkdownDocument()) {
      this.updateDecorationsForSelection();
    }
  }

  /**
   * Helper method to recreate a decoration type with updated settings.
   * Handles dispose, recreate, optional map update, and reapply.
   * 
   * @private
   * @param {TextEditorDecorationType} oldDecorationType - The decoration type to dispose
   * @param {() => TextEditorDecorationType} createNew - Factory function to create new decoration type
   * @param {(newType: TextEditorDecorationType) => void} updateProperty - Callback to update the property
   * @param {DecorationType | undefined} mapKey - Optional key to update in decorationTypeMap
   */
  private recreateDecorationType(
    oldDecorationType: TextEditorDecorationType,
    createNew: () => TextEditorDecorationType,
    updateProperty: (newType: TextEditorDecorationType) => void,
    mapKey?: DecorationType
  ): void {
    // Dispose the old decoration type
    oldDecorationType.dispose();
    
    // Create a new decoration type
    const newDecorationType = createNew();
    updateProperty(newDecorationType);
    
    // Update the decoration type map if key provided
    if (mapKey) {
      this.decorationTypeMap.set(mapKey, newDecorationType);
    }
    
    // Reapply decorations with the new decoration type
    if (this.activeEditor && this.isMarkdownDocument()) {
      this.updateDecorationsForSelection();
    }
  }

  /**
   * Recreates the ghost faint decoration type with updated opacity from settings.
   * Called when the ghostFaintOpacity configuration changes.
   */
  recreateGhostFaintDecorationType(): void {
    this.recreateDecorationType(
      this.ghostFaintDecorationType,
      () => GhostFaintDecorationType(this.getGhostFaintOpacity()),
      (newType) => { this.ghostFaintDecorationType = newType; }
    );
  }

  /**
   * Recreates the frontmatter delimiter decoration type with updated opacity from settings.
   * Called when the frontmatterDelimiterOpacity configuration changes.
   */
  recreateFrontmatterDelimiterDecorationType(): void {
    this.recreateDecorationType(
      this.frontmatterDelimiterDecorationType,
      () => FrontmatterDelimiterDecorationType(this.getFrontmatterDelimiterOpacity()),
      (newType) => { this.frontmatterDelimiterDecorationType = newType; }
    );
  }

  /**
   * Recreates the code block language decoration type with updated opacity from settings.
   * Called when the codeBlockLanguageOpacity configuration changes.
   */
  recreateCodeBlockLanguageDecorationType(): void {
    this.recreateDecorationType(
      this.codeBlockLanguageDecorationType,
      () => CodeBlockLanguageDecorationType(this.getCodeBlockLanguageOpacity()),
      (newType) => { this.codeBlockLanguageDecorationType = newType; },
      'codeBlockLanguage'
    );
  }

  /**
   * Dispose of resources and clear any pending updates.
   */
  dispose() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = undefined;
    }
    if (this.idleCallbackHandle !== undefined) {
      this.cancelIdleCallback(this.idleCallbackHandle);
      this.idleCallbackHandle = undefined;
    }
    this.decorationCache.clear();
    this.pendingUpdateVersion.clear();
    
    // Dispose all decoration types
    for (const decorationType of this.decorationTypeMap.values()) {
      decorationType.dispose();
    }
    this.ghostFaintDecorationType.dispose();
  }

  /**
   * Wrapper for requestIdleCallback that falls back to setTimeout if not available.
   * 
   * VS Code extensions run in Node.js, which doesn't have requestIdleCallback.
   * This method uses setTimeout as a fallback to simulate idle behavior.
   * 
   * @private
   * @param {Function} callback - The callback to execute when idle
   * @param {Object} options - Options for requestIdleCallback
   * @returns {number} Handle for cancellation
   */
  private requestIdleCallback(callback: () => void, options?: { timeout?: number }): number {
    // VS Code runs in Node.js, use setTimeout as fallback
    // In future, if running in browser context, we could check for requestIdleCallback
    return setTimeout(callback, options?.timeout || 50) as unknown as number;
  }

  /**
   * Wrapper for cancelIdleCallback that falls back to clearTimeout if not available.
   * 
   * @private
   * @param {number} handle - The handle returned by requestIdleCallback
   */
  private cancelIdleCallback(handle: number): void {
    // VS Code runs in Node.js, use clearTimeout as fallback
    clearTimeout(handle);
  }


  /**
   * Convert character positions to VS Code Range.
   * 
   * Note: The parser normalizes line endings (CRLF -> LF) before parsing.
   * Remark's positions are based on normalized text. VS Code's positionAt()
   * uses the actual document text. We need to map normalized positions to
   * actual document positions.
   * 
   * @private
   * @param {number} startPos - Start position in normalized text
   * @param {number} endPos - End position in normalized text
   * @param {string} originalText - Original document text (for offset mapping)
   * @returns {Range | null} VS Code Range or null if invalid
   */
  private createRange(startPos: number, endPos: number, originalText?: string): Range | null {
    if (!this.activeEditor) return null;

    try {
      // Map normalized positions to original document positions
      const mappedStart = mapNormalizedToOriginal(startPos, originalText);
      const mappedEnd = mapNormalizedToOriginal(endPos, originalText);

      const start = this.activeEditor.document.positionAt(mappedStart);
      const end = this.activeEditor.document.positionAt(mappedEnd);
      return new Range(start, end);
    } catch {
      // Invalid position
      return null;
    }
  }

  /**
   * Check if a decoration range intersects with any selection
   * Returns true if the decoration range overlaps with any selection range
   * 
   * Edge cases handled:
   * - Empty selections (cursor): only hides if cursor is within the decoration range
   * - Multiple selections: checks all selections
   * - Partial overlaps: any intersection hides the decoration
   * - Touching ranges: considered as overlapping
   * 
   * @param {Range} range - The decoration range to check
   * @param {Range[]} selectedRanges - Pre-computed non-empty selection ranges
   */
  private isRangeSelected(range: Range, selectedRanges: Range[]): boolean {
    if (!this.activeEditor) return false;

    // Check empty selections (cursors) - these need to be checked against the current editor state
    for (const selection of this.activeEditor.selections) {
      if (selection.isEmpty && range.contains(selection.start)) {
        return true;
      }
    }

    // Check non-empty selections using pre-computed ranges
    return selectedRanges.some((selection) => {
      // intersection() returns undefined if ranges don't overlap, or a Range if they do
      // If intersection exists (even if empty/touching), the ranges overlap
      const intersection = range.intersection(selection);
      return intersection !== undefined;
    });
  }

  /**
   * Check if any line containing the decoration has a selection or cursor
   * This hides decorations when the user clicks anywhere on a line (even without selecting)
   * to show raw markdown syntax for the entire line
   * 
   * This is more permissive than isRangeSelected - it hides decorations on any line
   * that has any selection/cursor, even if the selection doesn't overlap the decoration
   * 
   * @param {Range} range - The decoration range to check
   * @param {Set<number>} selectedLines - Pre-computed set of selected line numbers
   */
  private isLineOfRangeSelected(range: Range, selectedLines: Set<number>): boolean {
    if (!this.activeEditor || selectedLines.size === 0) return false;

    // Check if any line in the decoration range is in the selected lines set
    for (let line = range.start.line; line <= range.end.line; line++) {
      if (selectedLines.has(line)) {
        return true;
      }
    }

    return false;
  }
}