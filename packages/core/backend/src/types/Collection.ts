import type CollectionId from "../ids/CollectionId.js";
import type CollectionSettings from "./CollectionSettings.js";
import type CollectionVersion from "./CollectionVersion.js";

export default interface Collection {
  id: CollectionId;
  latestVersion: CollectionVersion;
  settings: CollectionSettings;
  createdAt: Date;
}
