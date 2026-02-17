import "maplibre-gl/dist/maplibre-gl.css";
import { extractErrorDetails } from "@superego/shared-utils";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import useTheme from "../../../business-logic/theme/useTheme.js";
import Alert from "../Alert/Alert.js";
import CodeBlock from "../CodeBlock/CodeBlock.js";
import getCenterAndZoom from "../GeoJSONInput/getCenterAndZoom.js";
import getMapStyle from "../GeoJSONInput/getMapStyle.js";

interface Props {
  geoJSON: { type: "FeatureCollection"; features: unknown[] };
  width: string;
  height: string;
  className?: string | undefined;
}
export default function EagerGeoJSONMap({
  geoJSON,
  width,
  height,
  className,
}: Props) {
  const intl = useIntl();
  const [renderingError, setRenderingError] = useState<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) {
      return;
    }

    setRenderingError(null);

    const map = new maplibregl.Map({
      container,
      style: getMapStyle(theme),
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
            new maplibregl.Popup().setLngLat(e.lngLat).setHTML(html).addTo(map);
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
    <div
      ref={mapContainerRef}
      style={{ width, height }}
      className={className}
    />
  ) : (
    <Alert
      title={intl.formatMessage({
        defaultMessage: "An error occurred rendering the map.",
      })}
      variant="error"
      style={{ width, height }}
    >
      <CodeBlock
        language="json"
        code={JSON.stringify(extractErrorDetails(renderingError))}
        showCopyButton={true}
      />
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
