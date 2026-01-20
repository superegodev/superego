import type { Schema } from "@superego/schema";
import type CollectionVersionId from "../ids/CollectionVersionId.js";
import type CollectionVersionSettings from "./CollectionVersionSettings.js";
import type RemoteConverters from "./RemoteConverters.js";
import type TypescriptModule from "./TypescriptModule.js";

export default interface CollectionVersion {
  id: CollectionVersionId;
  /** Id of the previous version. Null if this is the first version. */
  previousVersionId: CollectionVersionId | null;
  schema: Schema;
  settings: CollectionVersionSettings;
  /**
   * A function that computes blocking keys for a document's content. Used to
   * detect duplicate documents. Documents that share any blocking key are
   * considered duplicates. Null if duplicate detection is disabled.
   */
  contentBlockingKeysGetter: TypescriptModule | null;
  /**
   * The function that was run to migrate documents from the previous
   * version to this version. Null if this is the first version.
   */
  migration: TypescriptModule | null;
  remoteConverters: RemoteConverters | null;
  createdAt: Date;
}
