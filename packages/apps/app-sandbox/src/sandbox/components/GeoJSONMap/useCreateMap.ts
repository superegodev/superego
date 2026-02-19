import { Theme } from "@superego/backend";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import useTheme from "../../business-logic/theme/useTheme.js";
import { vars } from "../../themes.css.js";
import escapeHtml from "./escapeHtml.js";
import getCenterAndZoom from "./getCenterAndZoom.js";

export default function useCreateMap(geoJSON: {
  type: string;
  [key: string]: unknown;
}) {
  const [renderingError, setRenderingError] = useState<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) {
      return;
    }

    setRenderingError(null);

    mapContainer.style.setProperty("--_accent", vars.colors.accent);
    mapContainer.style.setProperty("--_text-inverse", vars.colors.text.inverse);
    const computedStyle = getComputedStyle(mapContainer);
    const resolvedAccent = computedStyle.getPropertyValue("--_accent").trim();
    const resolvedTextInverse = computedStyle
      .getPropertyValue("--_text-inverse")
      .trim();

    const map = new maplibregl.Map({
      container: mapContainer,
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
          data: geoJSON as unknown as GeoJSON.GeoJSON,
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
            "fill-color": resolvedAccent,
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
            "line-color": resolvedAccent,
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
            "circle-color": resolvedAccent,
            "circle-stroke-width": 2,
            "circle-stroke-color": resolvedTextInverse,
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

  return { renderingError, mapContainerRef };
}
