import { lazy, Suspense } from "react";
import type Props from "./Props.js";

const EagerMarkdownInput = lazy(() => import("./EagerMarkdownInput.js"));

export default function MarkdownInput(props: Props) {
  return (
    <Suspense>
      <EagerMarkdownInput {...props} />
    </Suspense>
  );
}
