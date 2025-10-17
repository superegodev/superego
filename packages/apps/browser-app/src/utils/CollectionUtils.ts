import type {
  Collection,
  CollectionId,
  CollectionSettings,
  Remote,
} from "@superego/backend";

export default {
  findCollection(
    collections: Collection[],
    collectionId: CollectionId,
  ): Collection | null {
    return collections.find(({ id }) => id === collectionId) ?? null;
  },

  getDisplayName(collection: {
    settings: Pick<CollectionSettings, "name" | "icon">;
  }): string {
    const { icon, name } = collection.settings;
    return icon ? `${icon}\u2002${name}` : name;
  },

  hasRemote(
    collection: Collection,
  ): collection is Collection & { remote: Remote } {
    return collection.remote !== null;
  },
};
