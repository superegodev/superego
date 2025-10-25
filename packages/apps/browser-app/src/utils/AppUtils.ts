import type { App, AppId, CollectionId } from "@superego/backend";

export default {
  findApp(apps: App[], appId: AppId): App | null {
    return apps.find(({ id }) => id === appId) ?? null;
  },

  getFirstTargetCollectionId(app: App): CollectionId | null {
    const [firstTargetedCollection] = app.latestVersion.targetCollections;
    return firstTargetedCollection ? firstTargetedCollection.id : null;
  },
};
