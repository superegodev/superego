import { valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";

export default function appSettingsSchema() {
  return v.strictObject({
    type: v.literal("CollectionView"),
    name: valibotSchemas.appName(),
    targetCollectionIds: v.array(v.string()),
  });
}
