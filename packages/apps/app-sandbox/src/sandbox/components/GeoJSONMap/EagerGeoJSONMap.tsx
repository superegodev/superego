import "maplibre-gl/dist/maplibre-gl.css";
import { extractErrorDetails } from "@superego/shared-utils";
import { Theme } from "@superego/backend";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import useTheme from "../../business-logic/theme/useTheme.js";
import Alert from "../Alert/Alert.js";

interface Props {
  geoJSON: { type: "FeatureCollection"; features: unknown[] };
  width: string;
  height: string;
}
export default function EagerGeoJSONMap({ geoJSON, width, height }: Props) {
  const [renderingError, setRenderingError] = useState<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const { renderingErrorAlertTitle } = useIntlMessages("GeoJSONMap");

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) {
      return;
    }

    setRenderingError(null);

    const map = new maplibregl.Map({
      container,
      style:
        theme === Theme.Dark
          ? "https://tiles.openfreemap.org/styles/fiord"
          : "https://tiles.openfreemap.org/styles/positron",
      ...getCenterAndZoom(geoJSON),
      attributionControl: false,
    });

    map.on("load", () => {
      try {
        map.addSource("geojson-data", {
          type: "geojson",
          data: geoJSON as GeoJSON.FeatureCollection,
        });

        map.addLayer({
          id: "geojson-fill",
          type: "fill",
          source: "geojson-data",
          filter: [
            "any",
            ["==", ["geometry-type"], "Polygon"],
            ["==", ["geometry-type"], "MultiPolygon"],
          ],
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": 0.2,
          },
        });

        map.addLayer({
          id: "geojson-line",
          type: "line",
          source: "geojson-data",
          filter: [
            "any",
            ["==", ["geometry-type"], "LineString"],
            ["==", ["geometry-type"], "MultiLineString"],
            ["==", ["geometry-type"], "Polygon"],
            ["==", ["geometry-type"], "MultiPolygon"],
          ],
          paint: {
            "line-color": "#3b82f6",
            "line-width": 2,
          },
        });

        map.addLayer({
          id: "geojson-circle",
          type: "circle",
          source: "geojson-data",
          filter: [
            "any",
            ["==", ["geometry-type"], "Point"],
            ["==", ["geometry-type"], "MultiPoint"],
          ],
          paint: {
            "circle-radius": 6,
            "circle-color": "#3b82f6",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        for (const layerId of [
          "geojson-circle",
          "geojson-fill",
          "geojson-line",
        ] as const) {
          map.on("click", layerId, (e) => {
            const feature = e.features?.[0];
            if (!feature) {
              return;
            }
            const props = feature.properties;
            if (!props || Object.keys(props).length === 0) {
              return;
            }
            const html = Object.entries(props)
              .map(
                ([k, v]) =>
                  `<strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}`,
              )
              .join("<br/>");
            new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(html)
              .addTo(map);
          });

          map.on("mouseenter", layerId, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", layerId, () => {
            map.getCanvas().style.cursor = "";
          });
        }
      } catch (error) {
        setRenderingError(error);
      }
    });

    map.on("error", (e) => {
      setRenderingError(e.error);
    });

    return () => {
      map.remove();
    };
  }, [geoJSON, theme]);

  return renderingError === null ? (
    <div ref={mapContainerRef} style={{ width, height }} />
  ) : (
    <Alert title={renderingErrorAlertTitle} variant="error">
      <pre style={{ whiteSpace: "pre-wrap" }}>
        <code>
          {JSON.stringify(extractErrorDetails(renderingError), null, 2)}
        </code>
      </pre>
    </Alert>
  );
}

function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

interface CenterAndZoom {
  center: [number, number];
  zoom: number;
}

const DEFAULT_CENTER_AND_ZOOM: CenterAndZoom = { center: [0, 20], zoom: 0 };

interface GeoJSONValue {
  type: string;
  [key: string]: unknown;
}

function getCenterAndZoom(
  geoJSON: GeoJSONValue | null | undefined,
): CenterAndZoom {
  if (!geoJSON) {
    return DEFAULT_CENTER_AND_ZOOM;
  }

  const coords = extractCoordinates(geoJSON);
  if (coords.length === 0) {
    return DEFAULT_CENTER_AND_ZOOM;
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

  const zoom = Math.max(
    0,
    Math.min(
      18,
      Math.floor(Math.min(Math.log2(360 / lonSpan), Math.log2(180 / latSpan))),
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
