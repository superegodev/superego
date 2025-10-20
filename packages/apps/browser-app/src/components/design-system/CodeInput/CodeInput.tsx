import { lazy, Suspense } from "react";
import type Props from "./Props.js";

const EagerCodeInput = lazy(() => import("./EagerCodeInput.js"));

// TODO: move to widgets
export default function CodeInput(props: Props) {
  return (
    <Suspense>
      <EagerCodeInput {...props} />
    </Suspense>
  );
}
