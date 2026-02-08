import { lazy, Suspense } from "react";
import type Props from "./Props.js";

const EagerGeoJSONInput = lazy(() => import("./EagerGeoJSONInput.js"));

export default function GeoJSONInput(props: Props) {
  return (
    <Suspense>
      <EagerGeoJSONInput {...props} />
    </Suspense>
  );
}
