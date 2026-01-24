import type {
  CollectionId,
  CollectionVersionId,
  CollectionVersionSettings,
  RemoteConverters,
  TypescriptModule,
} from "@superego/backend";
import type { Schema } from "@superego/schema";

export default interface CollectionVersionEntity {
  id: CollectionVersionId;
  previousVersionId: CollectionVersionId | null;
  collectionId: CollectionId;
  schema: Schema;
  settings: CollectionVersionSettings;
  contentBlockingKeysGetter: TypescriptModule | null;
  migration: TypescriptModule | null;
  remoteConverters: RemoteConverters | null;
  createdAt: Date;
}
