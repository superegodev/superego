import type { FileRef } from "@superego/schema";
import type { IntlShape } from "react-intl";
import { electronMainWorld } from "../business-logic/electron/electron.js";
import ToastType from "../business-logic/toasts/ToastType.js";
import toasts from "../business-logic/toasts/toasts.js";

export default async function openFileWithNativeApp(
  intl: IntlShape,
  file: FileRef,
): Promise<void> {
  if (!electronMainWorld.isElectron) {
    return;
  }

  const result = await electronMainWorld.openFileWithNativeApp(file);

  if (!result.success) {
    toasts.add({
      type: ToastType.Error,
      title: intl.formatMessage({ defaultMessage: "Opening file failed" }),
      error: result.error,
    });
  }
}
