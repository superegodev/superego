import type { TypescriptModule } from "@superego/backend";
import type { Schema } from "@superego/schema";
import { lowerFirst } from "es-toolkit";
import wellKnownLibPaths from "../../typescript/wellKnownLibPaths.js";
import { COMPILATION_REQUIRED } from "../constants.js";

export default function contentSummaryGetter(schema: Schema): TypescriptModule {
  const { rootType } = schema;
  const argName = lowerFirst(rootType);
  const importPath = `.${wellKnownLibPaths.collectionSchema.replace(".ts", ".js")}`;
  return {
    source: [
      `import type { ${rootType} } from "${importPath}";`,
      "",
      "export default function getContentSummary(",
      `  ${argName}: ${rootType}`,
      "): Record<string, string | number | boolean | null> {",
      "  return {};",
      "}",
    ].join("\n"),
    compiled: COMPILATION_REQUIRED,
  };
}
