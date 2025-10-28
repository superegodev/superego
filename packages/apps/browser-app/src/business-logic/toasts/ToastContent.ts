import type { ResultError } from "@superego/global-types";
import type ToastType from "./ToastType.js";

type ToastContent =
  | {
      type: ToastType.Success;
      title: string;
    }
  | {
      type: ToastType.Error;
      title: string;
      error: ResultError<string, any>;
    };

export default ToastContent;
