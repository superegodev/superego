import type { TypescriptModule } from "@superego/backend";
import {
  DataType,
  FormatId,
  type Schema,
  utils as schemaUtils,
} from "@superego/schema";
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
        `    ${makePropertyName(index, header)}: ${makePropertyValueStatement(schema, path, argName)} ?? "",`,
    ),
    "  };",
  ];
  return {
    source: [
      `import type { ${schema.rootType} } from "${importPath}";`,
      "",
      "export default function getContentSummary(",
      `  ${argName}: ${rootType}`,
      "): Record<string, string> {",
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
  return JSON.stringify(
    `{position:${index},sortable:true,default-sort:${index === 0 ? "asc" : "null"}} ${header}`,
  );
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
    return `""`;
  }

  switch (typeDefinition.dataType) {
    case DataType.String:
      return typeDefinition.format === FormatId.String.Instant
        ? `(${baseStatement} !== undefined ? LocalInstant.fromISO(${baseStatement}).toFormat() : "")`
        : baseStatement;
    case DataType.Enum:
    case DataType.StringLiteral:
      return baseStatement;
    case DataType.Number:
    case DataType.NumberLiteral:
      return `(${baseStatement} !== undefined ? String(${baseStatement}) : "")`;
    case DataType.Boolean:
    case DataType.BooleanLiteral:
      return `(${baseStatement} !== undefined ? (${baseStatement} ? "✔": "✖") : "")`;
    default:
      return "";
  }
}
