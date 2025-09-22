import type { DeletedEntities } from "@superego/backend";

export default function makeDeletedEntities(
  deletedEntities: Partial<DeletedEntities>,
): DeletedEntities {
  return {
    collectionCategories: deletedEntities.collectionCategories ?? [],
    collections: deletedEntities.collections ?? [],
    collectionVersions: deletedEntities.collectionVersions ?? [],
    documents: deletedEntities.documents ?? [],
    documentVersion: deletedEntities.documentVersion ?? [],
    files: deletedEntities.files ?? [],
    conversations: deletedEntities.conversations ?? [],
  };
}
