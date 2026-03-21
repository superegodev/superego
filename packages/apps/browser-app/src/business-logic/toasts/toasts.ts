import type ToastContent from "./ToastContent.js";
import toastQueue from "./toastQueue.js";
import ToastType from "./ToastType.js";

export default {
  add: (toastContent: ToastContent) => {
    toastQueue.add(
      toastContent,
      toastContent.type === ToastType.Success ? { timeout: 5_000 } : undefined,
    );
  },
};
