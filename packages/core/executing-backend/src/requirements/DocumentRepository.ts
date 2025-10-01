import type { CollectionId, DocumentId } from "@superego/backend";
import type DocumentEntity from "../entities/DocumentEntity.js";

export default interface DocumentRepository {
  insert(document: DocumentEntity): Promise<void>;
  delete(id: DocumentId): Promise<DocumentId>;
  deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentId[]>;
  exists(id: DocumentId): Promise<boolean>;
  find(id: DocumentId): Promise<DocumentEntity | null>;
  findWhereRemoteIdEq(remoteId: string): Promise<DocumentEntity | null>;
  findAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentEntity[]>;
}
