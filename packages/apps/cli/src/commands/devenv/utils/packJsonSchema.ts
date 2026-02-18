import { valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";

export default function packJsonSchema() {
  return v.strictObject({
    id: v.pipe(v.string(), v.startsWith("Pack_")),
    name: v.string(),
    shortDescription: v.string(),
    longDescription: v.string(),
    collectionCategories: v.array(
      v.strictObject({
        name: valibotSchemas.collectionCategoryName(),
        icon: v.nullable(valibotSchemas.icon()),
        parentId: v.nullable(v.string()),
      }),
    ),
  });
}
