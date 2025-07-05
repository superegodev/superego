import type { CollectionId, DocumentId, FileId } from "@superego/backend";
import type FileEntity from "../entities/FileEntity.js";

export default interface FileRepository {
  insertAll(
    filesWithContent: (FileEntity & { content: Uint8Array })[],
  ): Promise<void>;
  deleteAllWhereCollectionIdEq(collectionId: CollectionId): Promise<FileId[]>;
  deleteAllWhereDocumentIdEq(documentId: DocumentId): Promise<FileId[]>;
  find(id: FileId): Promise<FileEntity | null>;
  findAllWhereIdIn(ids: FileId[]): Promise<FileEntity[]>;
  getContent(id: FileId): Promise<Uint8Array | null>;
}
