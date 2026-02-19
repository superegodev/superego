import { lazy, Suspense } from "react";

interface Props {
  geoJSON: { type: "FeatureCollection"; features: unknown[] };
  width: string;
  height: string;
}

const EagerGeoJSONMap = lazy(() => import("./EagerGeoJSONMap.js"));

export default function GeoJSONMap(props: Props) {
  return (
    <Suspense>
      <EagerGeoJSONMap {...props} />
    </Suspense>
  );
}
