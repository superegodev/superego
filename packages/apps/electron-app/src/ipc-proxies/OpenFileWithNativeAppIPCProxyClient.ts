import type { UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type { FileRef } from "@superego/schema";
import { ipcRenderer } from "electron";

export default function OpenFileWithNativeAppIPCProxyClient() {
  return (file: FileRef): ResultPromise<null, UnexpectedError> =>
    ipcRenderer.invoke("openFileWithNativeApp", file);
}
