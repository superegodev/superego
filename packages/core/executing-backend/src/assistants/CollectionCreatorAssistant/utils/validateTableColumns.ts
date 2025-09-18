import type { ValidationIssue } from "@superego/backend";
import { DataType, type Schema, utils } from "@superego/schema";

export default function validateTableColumns(
  schema: Schema,
  tableColumns: { header: string; path: string }[],
): ValidationIssue[] {
  return tableColumns
    .flatMap((tableColumn, index): ValidationIssue | null => {
      const typeDefinition = utils.getTypeDefinitionAtPath(
        schema,
        tableColumn.path,
      );
      if (!typeDefinition) {
        return {
          message: "Invalid path: no property found at that path.",
          path: [{ key: index }],
        };
      }
      if (
        typeDefinition.dataType === DataType.File ||
        typeDefinition.dataType === DataType.JsonObject ||
        typeDefinition.dataType === DataType.List ||
        typeDefinition.dataType === DataType.Struct
      ) {
        return {
          message: "Invalid path: path must point to a primitive value.",
          path: [{ key: index }],
        };
      }
      return null;
    })
    .filter((issue) => issue !== null);
}
