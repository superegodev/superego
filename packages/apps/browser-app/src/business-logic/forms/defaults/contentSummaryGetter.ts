import type { TypescriptModule } from "@superego/backend";
import type { Schema } from "@superego/schema";
import wellKnownLibPaths from "../../typescript/wellKnownLibPaths.js";
import { COMPILATION_REQUIRED } from "../constants.js";

export default function contentSummaryGetter(schema: Schema): TypescriptModule {
  const { rootType } = schema;
  const argName = rootType[0]?.toLowerCase() + rootType.slice(1);
  const importPath = `.${wellKnownLibPaths.collectionSchema.replace(".ts", ".js")}`;
  return {
    source: [
      `import type { ${rootType} } from "${importPath}";`,
      "",
      "export default function getContentSummary(",
      `  ${argName}: ${rootType}`,
      "): Record<string, string> {",
      "  return {};",
      "}",
    ].join("\n"),
    compiled: COMPILATION_REQUIRED,
  };
}
