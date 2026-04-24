import { lazy, Suspense } from "react";
import type { FieldValues } from "react-hook-form";
import type Props from "./Props.js";

const EagerRHFAppVersionField = lazy(
  () => import("./EagerRHFAppVersionField.js"),
);

export default function RHFAppVersionField<T extends FieldValues>(
  props: Props<T>,
) {
  return (
    <Suspense>
      <EagerRHFAppVersionField {...(props as Props)} />
    </Suspense>
  );
}
