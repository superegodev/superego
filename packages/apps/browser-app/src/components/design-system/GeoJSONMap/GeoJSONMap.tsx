import { lazy, Suspense } from "react";

interface Props {
  geoJSON: { type: "FeatureCollection"; features: unknown[] };
  width: string;
  height: string;
  className?: string | undefined;
}

const EagerGeoJSONMap = lazy(() => import("./EagerGeoJSONMap.js"));

export default function GeoJSONMap(props: Props) {
  return (
    <Suspense>
      <EagerGeoJSONMap {...props} />
    </Suspense>
  );
}
