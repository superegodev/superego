import type { Connector, TypescriptModule } from "@superego/backend";
import type { Schema } from "@superego/schema";
import { lowerFirst } from "es-toolkit";
import wellKnownLibPaths from "../../typescript/wellKnownLibPaths.js";
import { COMPILATION_REQUIRED } from "../constants.js";

export default function fromRemoteDocument(
  collectionSchema: Schema,
  remoteDocumentTypescriptSchema: Connector["remoteDocumentTypescriptSchema"],
): TypescriptModule {
  const collectionRootType = collectionSchema.rootType;
  const remoteDocumentRootType = remoteDocumentTypescriptSchema.rootType;
  const argName = lowerFirst(remoteDocumentRootType);
  const collectionImportPath = `.${wellKnownLibPaths.collectionSchema.replace(".ts", ".js")}`;
  const remoteDocumentImportPath = `.${wellKnownLibPaths.remoteDocumentSchema.replace(".ts", ".js")}`;
  return {
    source: [
      `import type * as Local from "${collectionImportPath}";`,
      `import type * as Remote from "${remoteDocumentImportPath}";`,
      "",
      "export default function fromRemoteDocument(",
      `  ${argName}: Remote.${remoteDocumentRootType}`,
      `): Local.${collectionRootType} | null {`,
      "  return {};",
      "}",
    ].join("\n"),
    compiled: COMPILATION_REQUIRED,
  };
}
