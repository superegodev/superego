import { lazy, Suspense } from "react";
import type Props from "./Props.js";

const EagerExcalidrawInput = lazy(() => import("./EagerExcalidrawInput.js"));

export default function ExcalidrawInput(props: Props) {
  return (
    <Suspense>
      <EagerExcalidrawInput {...props} />
    </Suspense>
  );
}
