import type { FileId } from "@superego/backend";
import type { FileEntity } from "@superego/executing-backend";

export default interface SqliteFile {
  id: FileId;
  /** JSON */
  referenced_by: string;
  /** ISO 8601 */
  created_at: string;
  content: Buffer;
}

export function toEntity(file: Omit<SqliteFile, "content">): FileEntity {
  return {
    id: file.id,
    referencedBy: JSON.parse(file.referenced_by),
    createdAt: new Date(file.created_at),
  };
}
