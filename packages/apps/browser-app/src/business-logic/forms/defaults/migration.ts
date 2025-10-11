import type { TypescriptModule } from "@superego/backend";
import type { Schema } from "@superego/schema";
import { lowerFirst } from "es-toolkit";
import wellKnownLibPaths from "../../typescript/wellKnownLibPaths.js";
import { COMPILATION_REQUIRED } from "../constants.js";

export default function migration(
  currentSchema: Schema,
  nextSchema: Schema,
): TypescriptModule {
  const currentRootType = currentSchema.rootType;
  const nextRootType = nextSchema.rootType;
  const argName = lowerFirst(currentRootType);
  const currentImportPath = `.${wellKnownLibPaths.currentCollectionSchema.replace(".ts", ".js")}`;
  const nextImportPath = `.${wellKnownLibPaths.nextCollectionSchema.replace(".ts", ".js")}`;
  return {
    source: [
      `import type * as Current from "${currentImportPath}";`,
      `import type * as Next from "${nextImportPath}";`,
      "",
      "export default function migrate(",
      `  ${argName}: Current.${currentRootType}`,
      `): Next.${nextRootType} {`,
      `  return ${argName};`,
      "}",
    ].join("\n"),
    compiled: COMPILATION_REQUIRED,
  };
}
