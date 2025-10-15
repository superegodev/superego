import type { Connector, TypescriptModule } from "@superego/backend";
import type { Schema } from "@superego/schema";
import { lowerFirst } from "es-toolkit";
import wellKnownLibPaths from "../../typescript/wellKnownLibPaths.js";
import { COMPILATION_REQUIRED } from "../constants.js";

export default function toProtoRemoteDocument(
  collectionSchema: Schema,
  protoRemoteDocumentTypescriptSchema: NonNullable<
    Connector["protoRemoteDocumentTypescriptSchema"]
  >,
): TypescriptModule {
  const collectionRootType = collectionSchema.rootType;
  const protoRemoteDocumentRootType =
    protoRemoteDocumentTypescriptSchema.rootType;
  const collectionImportPath = `.${wellKnownLibPaths.collectionSchema.replace(".ts", ".js")}`;
  const protoRemoteDocumentImportPath = `.${wellKnownLibPaths.protoRemoteDocumentSchema.replace(".ts", ".js")}`;
  return {
    source: [
      `import type * as Local from "${collectionImportPath}";`,
      `import type * as Remote from "${protoRemoteDocumentImportPath}";`,
      "",
      "export default function toProtoRemoteDocument(",
      `  ${lowerFirst(collectionRootType)}: Local.${collectionRootType}`,
      `): Remote.${protoRemoteDocumentRootType} | null {`,
      "  return {};",
      "}",
    ].join("\n"),
    compiled: COMPILATION_REQUIRED,
  };
}
