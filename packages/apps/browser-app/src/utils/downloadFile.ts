import type {
  Backend,
  CollectionId,
  DocumentId,
  FileId,
} from "@superego/backend";
import type { FileRef, ProtoFile } from "@superego/schema";

export default async function downloadFile(
  backend: Backend,
  file: ProtoFile | FileRef,
  collectionId: CollectionId | undefined,
  documentId: DocumentId | undefined,
): Promise<void> {
  let content: Uint8Array;
  if ("content" in file) {
    content = file.content;
  } else {
    const { success, data, error } = await backend.files.getContent(
      // We know that when a FileRef is passed collectionId and documentId will
      // not be undefined.
      collectionId!,
      documentId!,
      file.id as FileId,
    );
    if (!success) {
      throw error;
    }
    content = data;
  }

  const blob = new Blob([content], { type: file.mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
