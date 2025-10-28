import type {
  App,
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

  findAllCollections(
    collections: Collection[],
    collectionIds: CollectionId[],
  ): Collection[] {
    return collections.filter(({ id }) => collectionIds.includes(id));
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

  getApps(collection: Collection, apps: App[]): App[] {
    return apps.filter((app) =>
      app.latestVersion.targetCollections.some(
        ({ id }) => id === collection.id,
      ),
    );
  },

  makeByIdMap(collections: Collection[]): Record<CollectionId, Collection> {
    const map: Record<CollectionId, Collection> = {};
    for (const collection of collections) {
      map[collection.id] = collection;
    }
    return map;
  },
};
