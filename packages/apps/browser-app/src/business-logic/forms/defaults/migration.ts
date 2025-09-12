import type { TypescriptModule } from "@superego/backend";
import type { Schema } from "@superego/schema";
import { FAILED_COMPILATION_OUTPUT } from "../constants.js";

export default function migration(
  currentSchema: Schema,
  currentSchemaTypescriptLibPath: string,
  nextSchema: Schema,
  nextSchemaTypescriptLibPath: string,
): TypescriptModule {
  const currentRootType = currentSchema.rootType;
  const nextRootType = nextSchema.rootType;
  const argName = currentRootType[0]?.toLowerCase() + currentRootType.slice(1);
  const currentImportPath = `.${currentSchemaTypescriptLibPath.replace(".ts", ".js")}`;
  const nextImportPath = `.${nextSchemaTypescriptLibPath.replace(".ts", ".js")}`;
  return {
    source: [
      `import type * as Current from "${currentImportPath}";`,
      `import type * as Next from "${nextImportPath}";`,
      "",
      `export default function migrate(${argName}: Current.${currentRootType}): Next.${nextRootType} {`,
      "  // Implement",
      "}",
    ].join("\n"),
    compiled: FAILED_COMPILATION_OUTPUT,
  };
}
