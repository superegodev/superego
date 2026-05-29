import type {
  CollectionVersion,
  LiteCollectionVersion,
} from "@superego/backend";

export default function makeLiteCollectionVersion(
  collectionVersion: CollectionVersion,
): LiteCollectionVersion {
  return {
    id: collectionVersion.id,
    previousVersionId: collectionVersion.previousVersionId,
    createdAt: collectionVersion.createdAt,
  };
}
