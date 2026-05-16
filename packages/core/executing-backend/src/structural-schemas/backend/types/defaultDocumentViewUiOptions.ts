import type { DefaultDocumentViewUiOptions } from "@superego/backend";
import * as v from "valibot";

const layoutNode = (): v.GenericSchema<unknown, unknown> => {
  // Recursive structure: nodes can be DivNodes (with children) or FieldNodes
  // (with a layout that's another array of nodes).
  return v.lazy(() =>
    v.union([
      v.strictObject({
        style: v.optional(
          v.record(v.string(), v.union([v.string(), v.number()])),
        ),
        children: v.optional(v.array(layoutNode())),
      }),
      v.strictObject({
        propertyPath: v.string(),
        layout: v.optional(v.array(layoutNode())),
        hideLabel: v.optional(v.boolean()),
        allowCollapsing: v.optional(v.boolean()),
        flexGrow: v.optional(v.boolean()),
      }),
    ]),
  );
};

export function defaultDocumentViewUiOptions(): v.GenericSchema<
  unknown,
  DefaultDocumentViewUiOptions
> {
  return v.strictObject({
    fullWidth: v.optional(v.boolean()),
    alwaysCollapsePrimarySidebar: v.optional(v.boolean()),
    rootLayout: v.optional(v.record(v.string(), v.array(layoutNode()))),
  }) as v.GenericSchema<unknown, DefaultDocumentViewUiOptions>;
}
