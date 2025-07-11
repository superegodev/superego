import type {
  CollectionId,
  CollectionVersionId,
  CollectionVersionSettings,
  TypescriptModule,
} from "@superego/backend";
import type { Schema } from "@superego/schema";

export default interface CollectionVersionEntity {
  id: CollectionVersionId;
  previousVersionId: CollectionVersionId | null;
  collectionId: CollectionId;
  schema: Schema;
  settings: CollectionVersionSettings;
  migration: TypescriptModule | null;
  createdAt: Date;
}
