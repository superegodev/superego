import type {
  CollectionId,
  CollectionVersionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import type MinimalDocumentVersionEntity from "../entities/MinimalDocumentVersionEntity.js";

export default interface DocumentVersionRepository {
  insert(documentVersion: DocumentVersionEntity): Promise<void>;
  updateContentSummary(
    id: DocumentVersionId,
    contentSummary: DocumentVersionEntity["contentSummary"],
  ): Promise<void>;
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
  findAllWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<MinimalDocumentVersionEntity[]>;
  findAllWhereCollectionVersionIdEq(
    collectionVersionId: CollectionVersionId,
  ): Promise<DocumentVersionEntity[]>;
  findAllLatestsWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentVersionEntity[]>;
  findAllLatestWhereReferencedDocumentsContains(
    collectionId: CollectionId,
    documentId: DocumentId,
  ): Promise<DocumentVersionEntity[]>;
  findAnyLatestWhereCollectionIdEqAndContentBlockingKeysOverlap(
    collectionId: CollectionId,
    contentBlockingKeys: string[],
  ): Promise<DocumentVersionEntity | null>;
}
