import type { Collection, CollectionId } from "@superego/backend";

export default {
  findCollection(
    collections: Collection[],
    collectionId: CollectionId,
  ): Collection | null {
    return collections.find(({ id }) => id === collectionId) ?? null;
  },

  getDisplayName(collection: Collection): string {
    const { icon, name } = collection.settings;
    return icon ? `${icon} ${name}` : name;
  },
};
