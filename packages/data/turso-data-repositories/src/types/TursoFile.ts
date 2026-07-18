import type { FileId } from "@superego/backend";
import type { FileEntity } from "@superego/executing-backend";

type TursoFile = {
  id: FileId;
  /** JSON */
  referenced_by: string;
  /** ISO 8601 */
  created_at: string;
  content: Uint8Array<ArrayBuffer>;
};
export default TursoFile;

export function toEntity(file: Omit<TursoFile, "content">): FileEntity {
  return {
    id: file.id,
    referencedBy: JSON.parse(file.referenced_by),
    createdAt: new Date(file.created_at),
  };
}
