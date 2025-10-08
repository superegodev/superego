import { type Schema, utils } from "@superego/schema";
import typeDefinitionValue from "./typeDefinitionValue.js";

export default function schemaValue(schema: Schema) {
  return typeDefinitionValue(utils.getRootType(schema), schema);
}
