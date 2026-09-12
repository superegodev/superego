import {
  DataType,
  type AnyTypeDefinition,
  valibotSchemas,
} from "@superego/schema";
import * as v from "valibot";

function supportedStateType(definition: AnyTypeDefinition): boolean {
  switch (definition.dataType) {
    case DataType.File:
    case DataType.DocumentRef:
      return false;
    case DataType.Struct:
      return Object.values(definition.properties).every(supportedStateType);
    case DataType.List:
      return supportedStateType(definition.items);
    default:
      return true;
  }
}
export default function appStateSchema() {
  return v.pipe(
    valibotSchemas.schema(),
    v.check(
      (schema) => Object.values(schema.types).every(supportedStateType),
      "App state cannot contain File or DocumentRef types.",
    ),
  );
}
