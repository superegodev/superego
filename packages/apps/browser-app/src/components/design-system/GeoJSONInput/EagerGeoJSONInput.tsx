import { Theme } from "@superego/backend";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef } from "react";
import useTheme from "../../../business-logic/theme/useTheme.js";
import classnames from "../../../utils/classnames.js";
import * as cs from "./GeoJSONInput.css.js";
import type Props from "./Props.js";

const SOURCE_ID = "geojson-input-source";

const LIGHT_COLORS = {
  background: "#f8fafc",
  fill: "#cbd5f5",
  line: "#64748b",
  point: "#475569",
  pointStroke: "#f8fafc",
};
const DARK_COLORS = {
  background: "#0f172a",
  fill: "#475569",
  line: "#94a3b8",
  point: "#e2e8f0",
  pointStroke: "#0f172a",
};

export default function EagerGeoJSONInput({
  value,
  isInvalid = false,
  isReadOnly = false,
  className,
}: Props) {
  const theme = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const colors = useMemo(
    () => (theme === Theme.Dark ? DARK_COLORS : LIGHT_COLORS),
    [theme],
  );
  const styleDefinition = useMemo(
    () => createStyleDefinition(colors.background),
    [colors.background],
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleDefinition,
      center: [0, 0],
      zoom: 1,
      attributionControl: false,
      interactive: !isReadOnly,
    });
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );
    if (isReadOnly) {
      map.scrollZoom.disable();
      map.boxZoom.disable();
      map.dragRotate.disable();
      map.dragPan.disable();
      map.keyboard.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();
    }
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [styleDefinition, isReadOnly]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    mapRef.current.setStyle(styleDefinition);
  }, [styleDefinition]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const data = normalizeGeoJson(value);
    const applyData = () => {
      ensureGeoJsonLayers(map, data, colors);
      fitToGeoJson(map, data);
    };
    if (map.isStyleLoaded()) {
      applyData();
      return;
    }
    map.once("styledata", applyData);
  }, [colors, value]);

  return (
    <div
      className={classnames(cs.GeoJSONInput.root, className)}
      data-invalid={isInvalid}
      data-read-only={isReadOnly}
    >
      <div ref={mapContainerRef} className={cs.GeoJSONInput.map} />
    </div>
  );
}

function normalizeGeoJson(
  value: Record<string, unknown> | null | undefined,
): maplibregl.GeoJSONSourceSpecification["data"] {
  if (!value || typeof value !== "object") {
    return { type: "FeatureCollection", features: [] };
  }
  const { __dataType, ...rest } = value as Record<string, unknown>;
  if ("type" in rest) {
    return rest as unknown as maplibregl.GeoJSONSourceSpecification["data"];
  }
  return { type: "FeatureCollection", features: [] };
}

function ensureGeoJsonLayers(
  map: maplibregl.Map,
  data: maplibregl.GeoJSONSourceSpecification["data"],
  colors: typeof LIGHT_COLORS,
) {
  const existingSource = map.getSource(SOURCE_ID);
  if (!existingSource) {
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data,
    });
  } else if ("setData" in existingSource) {
    (existingSource as maplibregl.GeoJSONSource).setData(data);
  }

  const fillLayerId = `${SOURCE_ID}-fill`;
  if (!map.getLayer(fillLayerId)) {
    map.addLayer({
      id: fillLayerId,
      type: "fill",
      source: SOURCE_ID,
      filter: ["==", "$type", "Polygon"],
      paint: {
        "fill-color": colors.fill,
        "fill-opacity": 0.35,
      },
    });
  } else {
    map.setPaintProperty(fillLayerId, "fill-color", colors.fill);
  }

  const lineLayerId = `${SOURCE_ID}-line`;
  if (!map.getLayer(lineLayerId)) {
    map.addLayer({
      id: lineLayerId,
      type: "line",
      source: SOURCE_ID,
      paint: {
        "line-color": colors.line,
        "line-width": 2,
      },
    });
  } else {
    map.setPaintProperty(lineLayerId, "line-color", colors.line);
  }

  const circleLayerId = `${SOURCE_ID}-circle`;
  if (!map.getLayer(circleLayerId)) {
    map.addLayer({
      id: circleLayerId,
      type: "circle",
      source: SOURCE_ID,
      filter: ["==", "$type", "Point"],
      paint: {
        "circle-color": colors.point,
        "circle-radius": 5,
        "circle-stroke-color": colors.pointStroke,
        "circle-stroke-width": 1,
      },
    });
  } else {
    map.setPaintProperty(circleLayerId, "circle-color", colors.point);
    map.setPaintProperty(
      circleLayerId,
      "circle-stroke-color",
      colors.pointStroke,
    );
  }
}

function createStyleDefinition(
  backgroundColor: string,
): maplibregl.StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": backgroundColor,
        },
      },
    ],
  };
}

function fitToGeoJson(
  map: maplibregl.Map,
  data: maplibregl.GeoJSONSourceSpecification["data"],
) {
  const coordinates = collectCoordinates(data);
  if (coordinates.length === 0) {
    return;
  }
  const bounds = coordinates.reduce(
    (acc, [lng, lat]) => {
      acc[0][0] = Math.min(acc[0][0], lng);
      acc[0][1] = Math.min(acc[0][1], lat);
      acc[1][0] = Math.max(acc[1][0], lng);
      acc[1][1] = Math.max(acc[1][1], lat);
      return acc;
    },
    [
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    ] as [[number, number], [number, number]],
  );
  map.fitBounds(bounds, { padding: 32, maxZoom: 12, duration: 0 });
}

function collectCoordinates(data: unknown): [number, number][] {
  if (!data || typeof data !== "object") {
    return [];
  }
  const normalized = data as unknown as Record<string, unknown>;
  if (normalized["type"] === "FeatureCollection") {
    const features = normalized["features"];
    if (!Array.isArray(features)) {
      return [];
    }
    return features.flatMap((feature) =>
      collectCoordinates(
        (feature as Record<string, unknown>)["geometry"] as unknown,
      ),
    );
  }
  if (normalized["type"] === "Feature") {
    return collectCoordinates(normalized["geometry"] as unknown);
  }
  if (normalized["type"] === "GeometryCollection") {
    const geometries = normalized["geometries"];
    if (!Array.isArray(geometries)) {
      return [];
    }
    return geometries.flatMap((geometry) => collectCoordinates(geometry));
  }
  if ("coordinates" in normalized) {
    return collectCoordinatesFromArray(normalized["coordinates"]);
  }
  return [];
}

function collectCoordinatesFromArray(coordinates: unknown): [number, number][] {
  if (!Array.isArray(coordinates)) {
    return [];
  }
  if (coordinates.length === 0) {
    return [];
  }
  if (
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    return [[coordinates[0], coordinates[1]]];
  }
  return coordinates.flatMap((entry) => collectCoordinatesFromArray(entry));
}
