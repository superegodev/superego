import { valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";

export default function collectionSettingsSchema() {
  return v.strictObject({
    name: valibotSchemas.collectionName(),
    icon: v.nullable(valibotSchemas.icon()),
    collectionCategoryId: v.optional(v.nullable(v.string()), null),
    defaultCollectionViewAppId: v.nullable(v.string()),
    description: v.nullable(v.string()),
    assistantInstructions: v.nullable(v.string()),
  });
}
