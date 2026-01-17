import type { ValidationIssue } from "@superego/backend";
import { DataType, type Schema, utils } from "@superego/schema";

const primitiveDataTypes = new Set([
  DataType.String,
  DataType.Enum,
  DataType.Number,
  DataType.Boolean,
  DataType.StringLiteral,
  DataType.NumberLiteral,
  DataType.BooleanLiteral,
]);

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
      if (!primitiveDataTypes.has(typeDefinition.dataType)) {
        return {
          message: "Invalid path: path must point to a primitive value.",
          path: [{ key: index }],
        };
      }
      return null;
    })
    .filter((issue) => issue !== null);
}
