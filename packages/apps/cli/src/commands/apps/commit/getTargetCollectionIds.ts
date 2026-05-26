import type { App, CollectionId } from "@superego/backend";

export default function getTargetCollectionIds(app: App): CollectionId[] {
  return app.latestVersion.targetCollections.map(
    (targetCollection) => targetCollection.id,
  );
}
