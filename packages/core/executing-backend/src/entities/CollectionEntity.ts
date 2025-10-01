import type { CollectionId, CollectionSettings } from "@superego/backend";
import type RemoteEntity from "./RemoteEntity.js";

export default interface CollectionEntity {
  id: CollectionId;
  settings: CollectionSettings;
  remote: RemoteEntity | null;
  createdAt: Date;
}
