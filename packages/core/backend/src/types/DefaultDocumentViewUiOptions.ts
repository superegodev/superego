interface DefaultDocumentViewUiOptions {
  /** Use the full width of the Main panel content. Defaults to false. */
  fullWidth?: boolean;
  /**
   * When true, the primary sidebar always collapses (like it does on mobile).
   * Defaults to false.
   */
  alwaysCollapsePrimarySidebar?: boolean;
  /** Layout of the root Struct type. */
  rootLayout?: DefaultDocumentViewUiOptions.Layout | undefined;
}

namespace DefaultDocumentViewUiOptions {
  export interface DivNode {
    /** React.CSSProperties. */
    style?: Record<string, string | number>;
    children?: HtmlAstNode[];
  }

  export interface FieldNode {
    /**
     * Path to a property in the schema. Examples:
     * - myProp
     * - myList.$
     * - myList.$.myProp
     */
    propertyPath: string;
    /** Only applies to StructFields. */
    layout?: Layout | undefined;
    /**
     * Hides the label section of the field. Defaults to false.
     *
     * Warning: the label can contain controls for the field. E.g., the "nullify"
     * button (for certain nullable Fields) or the "add" button (for List Fields).
     * Use at your own peril.
     */
    hideLabel?: boolean | undefined;
    /** Only applies to StructFields and ListFields. Defaults to true. */
    allowCollapsing?: boolean | undefined;
    /**
     * Makes the field grow its height to fill all available space. Defaults to
     * false.
     */
    grow?: boolean | undefined;
  }

  export type HtmlAstNode = DivNode | FieldNode;

  export type Layout = HtmlAstNode[];
}

export default DefaultDocumentViewUiOptions;
