import type { CollectionId, CollectionSettings } from "@superego/backend";

export default interface CollectionEntity {
  id: CollectionId;
  settings: CollectionSettings;
  createdAt: Date;
}
