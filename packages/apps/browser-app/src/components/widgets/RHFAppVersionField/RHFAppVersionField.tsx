import { lazy, Suspense } from "react";
import type Props from "./Props.js";

const EagerRHFAppVersionField = lazy(
  () => import("./EagerRHFAppVersionField.js"),
);

export default function RHFAppVersionField(props: Props) {
  return (
    <Suspense>
      <EagerRHFAppVersionField {...props} />
    </Suspense>
  );
}
