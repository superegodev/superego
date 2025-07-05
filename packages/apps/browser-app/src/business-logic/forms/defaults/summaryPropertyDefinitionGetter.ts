import type { TypescriptModule } from "@superego/backend";
import type { Schema } from "@superego/schema";
import { FAILED_COMPILATION_OUTPUT } from "../constants.js";

export default function summaryPropertyDefinitionGetter(
  schema: Schema,
  schemaTypescriptLibPath: string,
): TypescriptModule {
  const { rootType } = schema;
  const argName = rootType[0]?.toLowerCase() + rootType.slice(1);
  const importPath = `.${schemaTypescriptLibPath.replace(".ts", ".js")}`;
  return {
    source: [
      `import { ${rootType} } from "${importPath}";`,
      "",
      `export default function getValue(${argName}: ${rootType}): string {`,
      "  // Implement",
      "}",
    ].join("\n"),
    compiled: FAILED_COMPILATION_OUTPUT,
  };
}
