import { lazy, Suspense } from "react";
import type Props from "./Props.js";

const EagerRHFAppVersionFilesField = lazy(
  () => import("./EagerRHFAppVersionFilesField.js"),
);

export default function RHFAppVersionFilesField(props: Props) {
  return (
    <Suspense>
      <EagerRHFAppVersionFilesField {...props} />
    </Suspense>
  );
}
