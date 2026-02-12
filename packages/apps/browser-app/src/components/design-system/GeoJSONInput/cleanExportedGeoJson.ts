import type GeoJSONFeatureCollection from "./GeoJSONFeatureCollection.js";

// Geoman always exports a FeatureCollection regardless of the original input
// type, so this function always receives and returns a FeatureCollection.
export default function cleanExportedGeoJson(exported: {
  features: {
    type: unknown;
    geometry: unknown;
    properties: Record<string, unknown>;
  }[];
}): GeoJSONFeatureCollection {
  return {
    type: "FeatureCollection",
    features: (exported.features ?? []).map(
      (feature: {
        type: unknown;
        geometry: unknown;
        properties: Record<string, unknown>;
      }) => ({
        type: feature.type,
        geometry: feature.geometry,
        properties: Object.fromEntries(
          Object.entries(feature.properties ?? {}).filter(
            ([key]) => !key.startsWith("__gm"),
          ),
        ),
      }),
    ),
  };
}
