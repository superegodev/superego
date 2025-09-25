import type { TypescriptModule } from "@superego/backend";
import { DataType, type Schema, utils as schemaUtils } from "@superego/schema";
import wellKnownLibPaths from "../typescript/wellKnownLibPaths.js";

export default function makeContentSummaryGetter(
  schema: Schema,
  tableColumns: { header: string; path: string }[],
): TypescriptModule {
  const { rootType } = schema;
  const argName = rootType[0]?.toLowerCase() + rootType.slice(1);
  const importPath = `.${wellKnownLibPaths.collectionSchema.replace(".ts", ".js")}`;
  const returnStatement = [
    "  return {",
    ...tableColumns.map(
      ({ header, path }, index) =>
        `    ${makePropertyName(index, header)}: ${makePropertyValueStatement(schema, path, argName)},`,
    ),
    "  };",
  ];
  return {
    source: [
      `import type { ${schema.rootType} } from "${importPath}";`,
      "",
      "export default function getContentSummary(",
      `  ${argName}: ${rootType}`,
      "): Record<string, string | number | boolean | null> {",
      ...returnStatement,
      "}",
    ].join("\n"),
    compiled: [
      `export default function getContentSummary(${argName}) {`,
      ...returnStatement,
      "}",
    ].join("\n"),
  };
}

function makePropertyName(index: number, header: string): string {
  const attributes = [
    `position:${index}`,
    "sortable:true",
    index === 0 ? "default-sort:asc" : null,
  ]
    .filter((attribute) => attribute !== null)
    .join(",");
  return JSON.stringify(`{${attributes}} ${header}`);
}

function makePropertyValueStatement(
  schema: Schema,
  path: string,
  argName: string,
): string {
  const segments = schemaUtils.parsePath(path);
  const baseStatement = [
    `${argName}?.`,
    ...segments.map(({ type, value }) =>
      type === "ListItem" ? `[${value}]?.` : `${value}?.`,
    ),
  ]
    .join("")
    .replace(/\?\.$/, "");

  const typeDefinition = schemaUtils.getTypeDefinitionAtPath(schema, path);
  if (!typeDefinition) {
    return "null";
  }

  switch (typeDefinition.dataType) {
    case DataType.String:
    case DataType.Enum:
    case DataType.StringLiteral:
    case DataType.Number:
    case DataType.NumberLiteral:
    case DataType.Boolean:
    case DataType.BooleanLiteral:
      return `${baseStatement} ?? null`;
    default:
      return "null";
  }
}
