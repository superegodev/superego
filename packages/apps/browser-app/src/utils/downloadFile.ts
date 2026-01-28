import type { Backend, FileId } from "@superego/backend";
import type { FileRef, ProtoFile } from "@superego/schema";
import type { IntlShape } from "react-intl";
import ToastType from "../business-logic/toasts/ToastType.js";
import toasts from "../business-logic/toasts/toasts.js";

export default async function downloadFile(
  intl: IntlShape,
  backend: Backend,
  file: ProtoFile | FileRef,
): Promise<void> {
  let content: Uint8Array<ArrayBuffer>;
  if ("content" in file) {
    content = file.content;
  } else {
    const { success, data, error } = await backend.files.getContent(
      file.id as FileId,
    );
    if (!success) {
      toasts.add({
        type: ToastType.Error,
        title: intl.formatMessage({
          defaultMessage: "Downloading file failed",
        }),
        error: error,
      });
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
