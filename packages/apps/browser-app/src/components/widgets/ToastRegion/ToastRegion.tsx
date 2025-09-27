import { UNSTABLE_ToastRegion as ToastRegionRAC } from "react-aria-components";
import toastQueue from "../../../business-logic/toasts/toastQueue.js";
import Toast from "./Toast.js";
import * as cs from "./ToastRegion.css.js";

export function ToastRegion() {
  return (
    <ToastRegionRAC queue={toastQueue} className={cs.ToastRegion.root}>
      {({ toast }) => <Toast toast={toast} />}
    </ToastRegionRAC>
  );
}
