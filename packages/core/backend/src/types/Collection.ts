import type CollectionId from "../ids/CollectionId.js";
import type CollectionSettings from "./CollectionSettings.js";
import type CollectionVersion from "./CollectionVersion.js";
import type Remote from "./Remote.js";

export default interface Collection {
  id: CollectionId;
  latestVersion: CollectionVersion;
  settings: CollectionSettings;
  remote: Remote | null;
  createdAt: Date;
}
