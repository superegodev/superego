import type { Backend, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type { FileRef } from "@superego/schema";

type ElectronMainWorld =
  | {
      isElectron: true;
      backend: Backend;
      openInNativeBrowser: (url: string) => Promise<void>;
      openFileWithNativeApp: (
        file: FileRef,
      ) => ResultPromise<null, UnexpectedError>;
      windowClose: {
        confirmClose(): Promise<void>;
        onCloseRequested(callback: () => void): () => void;
      };
    }
  | {
      isElectron: false;
    };
export default ElectronMainWorld;
