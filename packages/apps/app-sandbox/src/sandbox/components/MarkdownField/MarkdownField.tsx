import { lazy, Suspense } from "react";
import Skeleton from "../Skeleton/Skeleton.js";
import type Props from "./Props.js";

const EagerMarkdownField = lazy(() => import("./EagerMarkdownField.js"));

export default function MarkdownField(props: Props) {
  return (
    <Suspense fallback={<Skeleton variant="rectangle" height="200px" />}>
      <EagerMarkdownField {...props} />
    </Suspense>
  );
}
