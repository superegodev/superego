import type CollectionEntity from "../entities/CollectionEntity.js";
import type RemoteEntity from "../entities/RemoteEntity.js";

export default {
  hasRemote(
    collection: CollectionEntity,
  ): collection is CollectionEntity & { remote: RemoteEntity } {
    return collection.remote !== null;
  },
};
