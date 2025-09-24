import { lazy, Suspense } from "react";
import type Props from "./Props.js";

const EagerCodeBlock = lazy(() => import("./EagerCodeBlock.js"));

export default function CodeBlock(props: Props) {
  return (
    <Suspense>
      <EagerCodeBlock {...props} />
    </Suspense>
  );
}
