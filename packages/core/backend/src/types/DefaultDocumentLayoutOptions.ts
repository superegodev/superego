export interface ColumnDefinition {
  /** CSS value, e.g. "1fr", "300px", "50%". */
  width: string;
  /**
   * - "scroll": column content scrolls independently (overflow-y: auto).
   * - "sticky": column takes the available height and doesn't scroll.
   *
   * Defaults to "scroll".
   */
  overflow?: "scroll" | "sticky";
}

export interface FieldUiOptions {
  /**
   * Only applies to StructFields. Defines the columns in which the sub-fields
   * will be rendered. Each column becomes a wrapper element that can have its
   * own scroll/overflow behavior.
   */
  columns?: ColumnDefinition[];
  /**
   * The column index (0-based) of the parent StructField that the field is
   * rendered in. Defaults to 0.
   */
  column?: number;
  /**
   * When inside a "sticky" column, the flex-grow value for this field. Fields
   * without flex stay at their natural size. Multiple fields with flex share
   * the available space proportionally.
   */
  flex?: number;
  /**
   * Hides the label section of the field. Defaults to false.
   *
   * Warning: the label can contain controls for the field. E.g., the "nullify"
   * button (for certain nullable Fields) or the "add" button (for List Fields).
   * Use at your own peril.
   */
  hideLabel?: boolean;
  /** Only applies to StructFields and ListFields. Defaults to true. */
  allowCollapsing?: boolean;
}

export default interface DefaultDocumentLayoutOptions {
  /** Use the full width of the Main panel content. */
  fullWidth: boolean;
  /** Collapse the sidebar. */
  collapseSidebar: boolean;
  /**
   * Maps every field to its options. If a field is not defined, default options
   * are applied for it. FieldUiOptions are validated according to the
   * fieldPath. So, for example, a fieldPath pointing to a StringField that has
   * option allowCollapsing set to true is invalid, since that option only
   * applies to StructFields or ListFields.
   */
  fieldUiOptions: {
    [fieldPath: `$${string}`]: FieldUiOptions;
  };
}
