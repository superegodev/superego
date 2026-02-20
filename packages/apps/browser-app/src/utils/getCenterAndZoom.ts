import type GeoJSONValue from "./GeoJSONValue.js";

interface CenterAndZoom {
  center: [number, number];
  zoom: number;
}

const DEFAULT: CenterAndZoom = { center: [0, 20], zoom: 0 };

export default function getCenterAndZoom(
  geoJSON: GeoJSONValue | null | undefined,
): CenterAndZoom {
  if (!geoJSON) {
    return DEFAULT;
  }

  const coords = extractCoordinates(geoJSON);
  if (coords.length === 0) {
    return DEFAULT;
  }

  let minLon = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  for (const [lon, lat] of coords) {
    if (lon < minLon) {
      minLon = lon;
    }
    if (lon > maxLon) {
      maxLon = lon;
    }
    if (lat < minLat) {
      minLat = lat;
    }
    if (lat > maxLat) {
      maxLat = lat;
    }
  }

  const center: [number, number] = [
    (minLon + maxLon) / 2,
    (minLat + maxLat) / 2,
  ];

  const lonSpan = maxLon - minLon;
  const latSpan = maxLat - minLat;

  if (lonSpan === 0 && latSpan === 0) {
    return { center, zoom: 14 };
  }

  // Approximate zoom: at zoom 0 the full 360° of longitude is visible. Each
  // zoom level halves the visible span. We pick the more constraining axis.
  const zoom = Math.max(
    0,
    Math.min(
      18,
      Math.floor(Math.min(Math.log2(360 / lonSpan), Math.log2(180 / latSpan))) +
        1,
    ),
  );

  return { center, zoom };
}

function extractCoordinates(geoJSON: GeoJSONValue): [number, number][] {
  switch (geoJSON.type) {
    case "FeatureCollection": {
      const features = geoJSON["features"] as GeoJSONValue[] | undefined;
      return features?.flatMap(extractCoordinates) ?? [];
    }
    case "Feature": {
      const geometry = geoJSON["geometry"] as GeoJSONValue | null | undefined;
      return geometry ? extractCoordinates(geometry) : [];
    }
    case "Point": {
      const coordinates = geoJSON["coordinates"] as
        | [number, number]
        | undefined;
      return coordinates ? [coordinates] : [];
    }
    case "MultiPoint":
    case "LineString": {
      const coordinates = geoJSON["coordinates"] as
        | [number, number][]
        | undefined;
      return coordinates ?? [];
    }
    case "MultiLineString":
    case "Polygon": {
      const coordinates = geoJSON["coordinates"] as
        | [number, number][][]
        | undefined;
      return coordinates?.flat() ?? [];
    }
    case "MultiPolygon": {
      const coordinates = geoJSON["coordinates"] as
        | [number, number][][][]
        | undefined;
      return coordinates?.flat(2) ?? [];
    }
    case "GeometryCollection": {
      const geometries = geoJSON["geometries"] as GeoJSONValue[] | undefined;
      return geometries?.flatMap(extractCoordinates) ?? [];
    }
    default:
      return [];
  }
}
