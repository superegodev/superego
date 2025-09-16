import type { TypescriptModule } from "@superego/backend";
import type { Schema } from "@superego/schema";

export default function contentSummaryGetter(
  schema: Schema,
  schemaTypescriptLibPath: string,
): TypescriptModule {
  const { rootType } = schema;
  const argName = rootType[0]?.toLowerCase() + rootType.slice(1);
  const importPath = `.${schemaTypescriptLibPath.replace(".ts", ".js")}`;
  return {
    source: [
      `import type { ${rootType} } from "${importPath}";`,
      "",
      "export default function getValue(",
      `  ${argName}: ${rootType}`,
      "): Record<string, string> {",
      "  return {};",
      "}",
    ].join("\n"),
    compiled: [
      `export default function getValue(${argName}) {`,
      "  return {};",
      "}",
    ].join("\n"),
  };
}
