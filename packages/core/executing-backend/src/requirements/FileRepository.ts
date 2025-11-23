import type { FileId } from "@superego/backend";
import type FileEntity from "../entities/FileEntity.js";

export default interface FileRepository {
  insertAll(
    filesWithContent: (FileEntity & { content: Uint8Array<ArrayBuffer> })[],
  ): Promise<void>;
  addReferenceToAll(
    ids: FileId[],
    reference: FileEntity.Reference,
  ): Promise<void>;
  deleteReferenceFromAll(
    reference:
      | Omit<FileEntity.DocumentVersionReference, "documentVersionId">
      | FileEntity.ConversationReference,
  ): Promise<void>;
  find(id: FileId): Promise<FileEntity | null>;
  findAllWhereIdIn(ids: FileId[]): Promise<FileEntity[]>;
  getContent(id: FileId): Promise<Uint8Array<ArrayBuffer> | null>;
}
