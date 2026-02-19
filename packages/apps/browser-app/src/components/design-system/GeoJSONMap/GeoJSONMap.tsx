import { lazy, Suspense } from "react";
import type Props from "./Props.js";

const EagerGeoJSONMap = lazy(() => import("./EagerGeoJSONMap.js"));

export default function GeoJSONMap(props: Props) {
  return (
    <Suspense>
      <EagerGeoJSONMap {...props} />
    </Suspense>
  );
}
