import type GeoJSONFeatureCollection from "./GeoJSONFeatureCollection.js";
import type GeoJSONValue from "./GeoJSONValue.js";

const GEOMETRY_TYPES = [
  "Point",
  "MultiPoint",
  "LineString",
  "MultiLineString",
  "Polygon",
  "MultiPolygon",
  "GeometryCollection",
];

/**
 * Wraps any valid GeoJSON value into a FeatureCollection so that Geoman can
 * import it. If the value is already a FeatureCollection, it is returned as-is.
 * A Feature is wrapped in a single-element FeatureCollection. A bare geometry
 * is first wrapped in a Feature, then in a FeatureCollection.
 */
export default function wrapAsFeatureCollection(
  value: GeoJSONValue,
): GeoJSONFeatureCollection {
  if (value.type === "FeatureCollection") {
    return value as GeoJSONFeatureCollection;
  }
  if (value.type === "Feature") {
    return {
      type: "FeatureCollection",
      features: [value],
    };
  }
  if (GEOMETRY_TYPES.includes(value.type)) {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: value,
          properties: {},
        },
      ],
    };
  }
  return { type: "FeatureCollection", features: [] };
}
