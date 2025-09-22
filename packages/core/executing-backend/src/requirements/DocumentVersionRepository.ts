import type {
  CollectionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";

export default interface DocumentVersionRepository {
  insert(documentVersion: DocumentVersionEntity): Promise<void>;
  deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentVersionId[]>;
  deleteAllWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<DocumentVersionId[]>;
  find(id: DocumentVersionId): Promise<DocumentVersionEntity | null>;
  findLatestWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<DocumentVersionEntity | null>;
  findAllLatestsWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentVersionEntity[]>;
}
