import type { TextEditorDecorationType } from 'vscode';
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
  SelectionOverlayDecorationType,
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
  EmojiDecorationType,
} from '../decorations';
import type { DecorationType } from '../parser';

type RegistryOptions = {
  getGhostFaintOpacity: () => number;
  getFrontmatterDelimiterOpacity: () => number;
  getCodeBlockLanguageOpacity: () => number;
};

export class DecorationTypeRegistry {
  private hideDecorationType!: TextEditorDecorationType;
  private transparentDecorationType!: TextEditorDecorationType;
  private ghostFaintDecorationType!: TextEditorDecorationType;
  private boldDecorationType!: TextEditorDecorationType;
  private italicDecorationType!: TextEditorDecorationType;
  private boldItalicDecorationType!: TextEditorDecorationType;
  private strikethroughDecorationType!: TextEditorDecorationType;
  private codeDecorationType!: TextEditorDecorationType;
  private codeBlockDecorationType!: TextEditorDecorationType;
  private codeBlockLanguageDecorationType!: TextEditorDecorationType;
  private selectionOverlayDecorationType!: TextEditorDecorationType;
  private headingDecorationType!: TextEditorDecorationType;
  private heading1DecorationType!: TextEditorDecorationType;
  private heading2DecorationType!: TextEditorDecorationType;
  private heading3DecorationType!: TextEditorDecorationType;
  private heading4DecorationType!: TextEditorDecorationType;
  private heading5DecorationType!: TextEditorDecorationType;
  private heading6DecorationType!: TextEditorDecorationType;
  private linkDecorationType!: TextEditorDecorationType;
  private imageDecorationType!: TextEditorDecorationType;
  private blockquoteDecorationType!: TextEditorDecorationType;
  private listItemDecorationType!: TextEditorDecorationType;
  private orderedListItemDecorationType!: TextEditorDecorationType;
  private horizontalRuleDecorationType!: TextEditorDecorationType;
  private checkboxUncheckedDecorationType!: TextEditorDecorationType;
  private checkboxCheckedDecorationType!: TextEditorDecorationType;
  private frontmatterDecorationType!: TextEditorDecorationType;
  private frontmatterDelimiterDecorationType!: TextEditorDecorationType;
  private emojiDecorationType!: TextEditorDecorationType;

  private decorationTypeMap = new Map<DecorationType, TextEditorDecorationType>();

  constructor(private options: RegistryOptions) {
    this.hideDecorationType = HideDecorationType();
    this.transparentDecorationType = TransparentDecorationType();
    this.ghostFaintDecorationType = GhostFaintDecorationType(this.options.getGhostFaintOpacity());
    this.boldDecorationType = BoldDecorationType();
    this.italicDecorationType = ItalicDecorationType();
    this.boldItalicDecorationType = BoldItalicDecorationType();
    this.strikethroughDecorationType = StrikethroughDecorationType();
    this.codeDecorationType = CodeDecorationType();
    this.codeBlockDecorationType = CodeBlockDecorationType();
    this.codeBlockLanguageDecorationType = CodeBlockLanguageDecorationType(this.options.getCodeBlockLanguageOpacity());
    this.selectionOverlayDecorationType = SelectionOverlayDecorationType();
    this.headingDecorationType = HeadingDecorationType();
    this.heading1DecorationType = Heading1DecorationType();
    this.heading2DecorationType = Heading2DecorationType();
    this.heading3DecorationType = Heading3DecorationType();
    this.heading4DecorationType = Heading4DecorationType();
    this.heading5DecorationType = Heading5DecorationType();
    this.heading6DecorationType = Heading6DecorationType();
    this.linkDecorationType = LinkDecorationType();
    this.imageDecorationType = ImageDecorationType();
    this.blockquoteDecorationType = BlockquoteDecorationType();
    this.listItemDecorationType = ListItemDecorationType();
    this.orderedListItemDecorationType = OrderedListItemDecorationType();
    this.horizontalRuleDecorationType = HorizontalRuleDecorationType();
    this.checkboxUncheckedDecorationType = CheckboxUncheckedDecorationType();
    this.checkboxCheckedDecorationType = CheckboxCheckedDecorationType();
    this.frontmatterDecorationType = FrontmatterDecorationType();
    this.frontmatterDelimiterDecorationType = FrontmatterDelimiterDecorationType(this.options.getFrontmatterDelimiterOpacity());
    this.emojiDecorationType = EmojiDecorationType();

    this.decorationTypeMap = new Map<DecorationType, TextEditorDecorationType>([
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
      ['emoji', this.emojiDecorationType],
      // Keep this last so it is applied after backgrounds.
      ['selectionOverlay', this.selectionOverlayDecorationType],
    ]);
  }

  getMap(): Map<DecorationType, TextEditorDecorationType> {
    return this.decorationTypeMap;
  }

  getGhostFaintDecorationType(): TextEditorDecorationType {
    return this.ghostFaintDecorationType;
  }

  recreateCodeDecorationType(): void {
    this.recreateDecorationType(
      this.codeDecorationType,
      () => CodeDecorationType(),
      (newType) => { this.codeDecorationType = newType; },
      'code'
    );
  }

  recreateGhostFaintDecorationType(): void {
    this.recreateDecorationType(
      this.ghostFaintDecorationType,
      () => GhostFaintDecorationType(this.options.getGhostFaintOpacity()),
      (newType) => { this.ghostFaintDecorationType = newType; }
    );
  }

  recreateFrontmatterDelimiterDecorationType(): void {
    this.recreateDecorationType(
      this.frontmatterDelimiterDecorationType,
      () => FrontmatterDelimiterDecorationType(this.options.getFrontmatterDelimiterOpacity()),
      (newType) => { this.frontmatterDelimiterDecorationType = newType; }
    );
  }

  recreateCodeBlockLanguageDecorationType(): void {
    this.recreateDecorationType(
      this.codeBlockLanguageDecorationType,
      () => CodeBlockLanguageDecorationType(this.options.getCodeBlockLanguageOpacity()),
      (newType) => { this.codeBlockLanguageDecorationType = newType; },
      'codeBlockLanguage'
    );
  }

  dispose(): void {
    for (const decorationType of this.decorationTypeMap.values()) {
      decorationType.dispose();
    }
    this.ghostFaintDecorationType.dispose();
  }

  private recreateDecorationType(
    oldDecorationType: TextEditorDecorationType,
    createNew: () => TextEditorDecorationType,
    updateProperty: (newType: TextEditorDecorationType) => void,
    mapKey?: DecorationType
  ): void {
    oldDecorationType.dispose();

    const newDecorationType = createNew();
    updateProperty(newDecorationType);

    if (mapKey) {
      this.decorationTypeMap.set(mapKey, newDecorationType);
    }
  }
}
