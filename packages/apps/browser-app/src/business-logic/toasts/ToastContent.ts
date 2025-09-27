import type ToastType from "./ToastType.js";

export default interface ToastContent {
  type: ToastType;
  title: string;
  description?: string;
}
