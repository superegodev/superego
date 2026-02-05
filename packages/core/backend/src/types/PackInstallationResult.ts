import type App from "./App.js";
import type Collection from "./Collection.js";
import type Document from "./Document.js";

export default interface PackInstallationResult {
  collections: Collection[];
  apps: App[];
  documents: Document[];
}
