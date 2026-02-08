export default function geoJsonFeatureCollection() {
  return {
    type: "FeatureCollection" as const,
    features: [] as unknown[],
  };
}
