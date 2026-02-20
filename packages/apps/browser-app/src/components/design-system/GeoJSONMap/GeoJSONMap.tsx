import { lazy, Suspense } from "react";
import Skeleton from "../Skeleton/Skeleton.js";
import type Props from "./Props.js";

const EagerGeoJSONMap = lazy(() => import("./EagerGeoJSONMap.js"));

export default function GeoJSONMap(props: Props) {
  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangle"
          width={props.width}
          height={props.height}
        />
      }
    >
      <EagerGeoJSONMap {...props} />
    </Suspense>
  );
}
