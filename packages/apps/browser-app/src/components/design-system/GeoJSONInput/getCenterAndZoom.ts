import type GeoJSONValue from "./GeoJSONValue.js";

interface CenterAndZoom {
  center: [number, number];
  zoom: number;
}

const DEFAULT: CenterAndZoom = { center: [0, 20], zoom: 0 };

export default function getCenterAndZoom(
  geoJson: GeoJSONValue | null | undefined,
): CenterAndZoom {
  if (!geoJson) {
    return DEFAULT;
  }

  const coords = extractCoordinates(geoJson);
  if (coords.length === 0) {
    return DEFAULT;
  }

  let minLon = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  for (const [lon, lat] of coords) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
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

  // Approximate zoom: at zoom 0 the full 360° of longitude is visible.
  // Each zoom level halves the visible span. We pick the more constraining
  // axis and subtract 1 for padding.
  const zoom = Math.max(
    0,
    Math.min(
      18,
      Math.floor(
        Math.min(Math.log2(360 / lonSpan), Math.log2(180 / latSpan)),
      ),
    ),
  );

  return { center, zoom };
}

function extractCoordinates(geoJson: GeoJSONValue): [number, number][] {
  switch (geoJson.type) {
    case "FeatureCollection": {
      const features = geoJson["features"] as GeoJSONValue[] | undefined;
      return features?.flatMap(extractCoordinates) ?? [];
    }
    case "Feature": {
      const geometry = geoJson["geometry"] as GeoJSONValue | null | undefined;
      return geometry ? extractCoordinates(geometry) : [];
    }
    case "Point": {
      const coordinates = geoJson["coordinates"] as
        | [number, number]
        | undefined;
      return coordinates ? [coordinates] : [];
    }
    case "MultiPoint":
    case "LineString": {
      const coordinates = geoJson["coordinates"] as
        | [number, number][]
        | undefined;
      return coordinates ?? [];
    }
    case "MultiLineString":
    case "Polygon": {
      const coordinates = geoJson["coordinates"] as
        | [number, number][][]
        | undefined;
      return coordinates?.flat() ?? [];
    }
    case "MultiPolygon": {
      const coordinates = geoJson["coordinates"] as
        | [number, number][][][]
        | undefined;
      return coordinates?.flat(2) ?? [];
    }
    case "GeometryCollection": {
      const geometries = geoJson["geometries"] as GeoJSONValue[] | undefined;
      return geometries?.flatMap(extractCoordinates) ?? [];
    }
    default:
      return [];
  }
}
