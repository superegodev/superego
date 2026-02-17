import { valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";

export default function collectionSettingsSchema() {
  return v.strictObject({
    name: valibotSchemas.collectionName(),
    icon: v.nullable(valibotSchemas.icon()),
    description: v.nullable(v.string()),
    assistantInstructions: v.nullable(v.string()),
    defaultCollectionViewAppId: v.nullable(v.string()),
  });
}
