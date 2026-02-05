import type PackId from "../ids/PackId.js";
import type PackAppDefinition from "./PackAppDefinition.js";
import type PackCollectionDefinition from "./PackCollectionDefinition.js";
import type PackDocumentDefinition from "./PackDocumentDefinition.js";
import type PackInfo from "./PackInfo.js";

export default interface Pack {
  id: PackId;
  info: PackInfo;
  collections: PackCollectionDefinition[];
  apps: PackAppDefinition[];
  documents: PackDocumentDefinition[];
}
