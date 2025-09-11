import { lazy, Suspense } from "react";
import type Props from "./Props.js";

const EagerTypescriptModuleInput = lazy(
  () => import("./EagerTypescriptModuleInput.js"),
);

export default function TypescriptModuleInput(props: Props) {
  return (
    <Suspense>
      <EagerTypescriptModuleInput {...props} />
    </Suspense>
  );
}
