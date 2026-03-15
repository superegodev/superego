import type {
  App,
  Collection,
  CollectionId,
  CollectionVersionId,
} from "@superego/backend";
import CollectionUtils from "../../../utils/CollectionUtils.js";

export type Incompatibility =
  | {
      type: "WasDeleted";
      id: CollectionId;
    }
  | {
      type: "HasNewVersion";
      id: CollectionId;
      appVersionId: CollectionVersionId;
      latestVersionId: CollectionVersionId;
    };

export default function findIncompatibilities(
  app: App,
  targetCollections: Collection[],
): Incompatibility[] | null {
  const targetCollectionsById = CollectionUtils.makeByIdMap(targetCollections);
  const incompatibilities = app.latestVersion.targetCollections
    .map(({ id, versionId }) =>
      !targetCollectionsById[id]
        ? { type: "WasDeleted" as const, id }
        : targetCollectionsById[id].latestVersion.id !== versionId
          ? {
              type: "HasNewVersion" as const,
              id,
              appVersionId: versionId,
              latestVersionId: targetCollectionsById[id].latestVersion.id,
            }
          : null,
    )
    .filter((incompatibility) => incompatibility !== null);
  return incompatibilities.length > 0 ? incompatibilities : null;
}
