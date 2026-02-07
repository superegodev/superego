import { Theme } from "@superego/backend";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef } from "react";
import useTheme from "../../../business-logic/theme/useTheme.js";
import classnames from "../../../utils/classnames.js";
import type Props from "./Props.js";
import * as cs from "./GeoJSONInput.css.js";

const LIGHT_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const DARK_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const SOURCE_ID = "geojson-input-source";

export default function EagerGeoJSONInput({
  value,
  isInvalid = false,
  isReadOnly = false,
  className,
}: Props) {
  const theme = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const styleUrl = useMemo(
    () => (theme === Theme.Dark ? DARK_STYLE : LIGHT_STYLE),
    [theme],
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
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
  }, [styleUrl, isReadOnly]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    mapRef.current.setStyle(styleUrl);
  }, [styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const data = normalizeGeoJson(value);
    const applyData = () => {
      ensureGeoJsonLayers(map, data);
      fitToGeoJson(map, data);
    };
    if (map.isStyleLoaded()) {
      applyData();
      return;
    }
    map.once("styledata", applyData);
  }, [value, styleUrl]);

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
    return rest as maplibregl.GeoJSONSourceSpecification["data"];
  }
  return { type: "FeatureCollection", features: [] };
}

function ensureGeoJsonLayers(
  map: maplibregl.Map,
  data: maplibregl.GeoJSONSourceSpecification["data"],
) {
  const existingSource = map.getSource(SOURCE_ID);
  if (existingSource && "setData" in existingSource) {
    (existingSource as maplibregl.GeoJSONSource).setData(data);
    return;
  }
  map.addSource(SOURCE_ID, {
    type: "geojson",
    data,
  });
  map.addLayer({
    id: `${SOURCE_ID}-fill`,
    type: "fill",
    source: SOURCE_ID,
    filter: ["==", "$type", "Polygon"],
    paint: {
      "fill-color": "#9ca3af",
      "fill-opacity": 0.35,
    },
  });
  map.addLayer({
    id: `${SOURCE_ID}-line`,
    type: "line",
    source: SOURCE_ID,
    paint: {
      "line-color": "#6b7280",
      "line-width": 2,
    },
  });
  map.addLayer({
    id: `${SOURCE_ID}-circle`,
    type: "circle",
    source: SOURCE_ID,
    filter: ["==", "$type", "Point"],
    paint: {
      "circle-color": "#4b5563",
      "circle-radius": 5,
      "circle-stroke-color": "#f3f4f6",
      "circle-stroke-width": 1,
    },
  });
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

function collectCoordinates(
  data: maplibregl.GeoJSONSourceSpecification["data"],
): [number, number][] {
  if (!data || typeof data !== "object") {
    return [];
  }
  const normalized = data as Record<string, unknown>;
  if (normalized.type === "FeatureCollection") {
    const features = normalized.features;
    if (!Array.isArray(features)) {
      return [];
    }
    return features.flatMap((feature) =>
      collectCoordinates((feature as Record<string, unknown>).geometry),
    );
  }
  if (normalized.type === "Feature") {
    return collectCoordinates(normalized.geometry);
  }
  if (normalized.type === "GeometryCollection") {
    const geometries = normalized.geometries;
    if (!Array.isArray(geometries)) {
      return [];
    }
    return geometries.flatMap((geometry) => collectCoordinates(geometry));
  }
  if ("coordinates" in normalized) {
    return collectCoordinatesFromArray(normalized.coordinates);
  }
  return [];
}

function collectCoordinatesFromArray(
  coordinates: unknown,
): [number, number][] {
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
