import { lazy, Suspense } from "react";
import Skeleton from "../Skeleton/Skeleton.js";
import type Props from "./Props.js";

const EagerTiptapRichTextField = lazy(
  () => import("./EagerTiptapRichTextField.js"),
);

export default function TiptapRichTextField(props: Props) {
  return (
    <Suspense fallback={<Skeleton variant="rectangle" height="200px" />}>
      <EagerTiptapRichTextField {...props} />
    </Suspense>
  );
}
