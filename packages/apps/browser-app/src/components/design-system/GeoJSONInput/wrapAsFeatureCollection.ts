import type GeoJSONValue from "../../../utils/GeoJSONValue.js";
import type GeoJSONFeatureCollection from "./GeoJSONFeatureCollection.js";

const SUPPORTED_GEOMETRY_TYPES = new Set([
  "Point",
  "MultiPoint",
  "LineString",
  "MultiLineString",
  "Polygon",
  "MultiPolygon",
  "GeometryCollection",
]);

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
  if (SUPPORTED_GEOMETRY_TYPES.has(value.type)) {
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
