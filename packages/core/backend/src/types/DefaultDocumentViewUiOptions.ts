import * as v from "valibot";

interface DefaultDocumentViewUiOptions {
  /** Use the full width of the Main panel content. Defaults to false. */
  fullWidth?: boolean;
  /**
   * When true, the primary sidebar always collapses (like it does on mobile).
   * Defaults to false.
   */
  alwaysCollapsePrimarySidebar?: boolean;
  /**
   * Responsive layouts for the root Struct type. Keys are CSS media feature
   * expressions (e.g. "(min-width: 65rem)"). Use "all" as a catch-all fallback
   * (it always matches). The first matching expression (in insertion order)
   * wins at runtime.
   */
  rootLayout?:
    | {
        [mediaFeatureExpression: string]: DefaultDocumentViewUiOptions.Layout;
      }
    | undefined;
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
     * Makes the field flex-grow its height to fill all available space.
     * Defaults to false.
     */
    flexGrow?: boolean | undefined;
  }

  export type HtmlAstNode = DivNode | FieldNode;

  export type Layout = HtmlAstNode[];
}

const divNodeSchema: v.GenericSchema<DefaultDocumentViewUiOptions.DivNode> =
  v.object({
    style: v.optional(v.record(v.string(), v.union([v.string(), v.number()]))),
    children: v.optional(v.array(v.lazy(() => htmlAstNodeSchema))),
  });

const fieldNodeSchema: v.GenericSchema<DefaultDocumentViewUiOptions.FieldNode> =
  v.object({
    propertyPath: v.string(),
    layout: v.optional(v.lazy(() => layoutSchema)),
    hideLabel: v.optional(v.boolean()),
    allowCollapsing: v.optional(v.boolean()),
    flexGrow: v.optional(v.boolean()),
  });

const htmlAstNodeSchema: v.GenericSchema<DefaultDocumentViewUiOptions.HtmlAstNode> =
  v.union([divNodeSchema, fieldNodeSchema]);

const layoutSchema: v.GenericSchema<DefaultDocumentViewUiOptions.Layout> =
  v.array(htmlAstNodeSchema);

const DefaultDocumentViewUiOptionsSchema: v.GenericSchema<DefaultDocumentViewUiOptions> =
  v.object({
    fullWidth: v.optional(v.boolean()),
    alwaysCollapsePrimarySidebar: v.optional(v.boolean()),
    rootLayout: v.optional(v.record(v.string(), layoutSchema)),
  });
export default DefaultDocumentViewUiOptionsSchema;
export type { DefaultDocumentViewUiOptions };
