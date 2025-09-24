import { lazy, Suspense } from "react";
import type Props from "./Props.js";

const EagerTiptapInput = lazy(() => import("./EagerTiptapInput.js"));

export default function TiptapInput(props: Props) {
  return (
    <Suspense>
      <EagerTiptapInput {...props} />
    </Suspense>
  );
}
