import type { TypescriptModule } from "@superego/backend";
import type { Schema } from "@superego/schema";
import { lowerFirst } from "es-toolkit";
import wellKnownLibPaths from "../../typescript/wellKnownLibPaths.js";
import { COMPILATION_REQUIRED } from "../constants.js";

export default function migration(
  previousSchema: Schema,
  nextSchema: Schema,
): TypescriptModule {
  const previousRootType = previousSchema.rootType;
  const nextRootType = nextSchema.rootType;
  const argName = lowerFirst(previousRootType);
  const previousImportPath = `.${wellKnownLibPaths.previousCollectionSchema.replace(".ts", ".js")}`;
  const nextImportPath = `.${wellKnownLibPaths.nextCollectionSchema.replace(".ts", ".js")}`;
  return {
    source: [
      `import type * as Previous from "${previousImportPath}";`,
      `import type * as Next from "${nextImportPath}";`,
      "",
      "export default function migrate(",
      `  ${argName}: Previous.${previousRootType}`,
      `): Next.${nextRootType} {`,
      `  return ${argName};`,
      "}",
    ].join("\n"),
    compiled: COMPILATION_REQUIRED,
  };
}
