import Geoman, { type GmOptionsPartial } from "@geoman-io/maplibre-geoman-free";
import "@geoman-io/maplibre-geoman-free/dist/maplibre-geoman.css";
import { Theme } from "@superego/backend";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef } from "react";
import useTheme from "../../../business-logic/theme/useTheme.js";
import classnames from "../../../utils/classnames.js";
import * as cs from "./GeoJSONInput.css.js";
import type Props from "./Props.js";

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
  onChange,
  isInvalid = false,
  isReadOnly = false,
  className,
}: Props) {
  const theme = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const geomanRef = useRef<Geoman | null>(null);
  const lastEmittedGeoJsonRef = useRef<string | null>(null);
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
      interactive: true,
    });
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );
    const geoman = new Geoman(map, buildGeomanOptions(colors));
    geomanRef.current = geoman;
    mapRef.current = map;
    return () => {
      void geomanRef.current?.destroy({ removeSources: true });
      geomanRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [colors, styleDefinition]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    mapRef.current.setStyle(styleDefinition);
  }, [styleDefinition]);

  useEffect(() => {
    const map = mapRef.current;
    const geoman = geomanRef.current;
    if (!geoman || !map) {
      return;
    }
    let isActive = true;
    const data = normalizeGeoJson(value);
    const applyData = () => {
      if (!isActive) {
        return;
      }
      const serialized = serializeGeoJson(data);
      if (serialized === lastEmittedGeoJsonRef.current) {
        return;
      }
      geoman.features.deleteAll();
      if (!isEmptyGeoJson(data)) {
        geoman.features.importGeoJson(
          data as unknown as Parameters<
            typeof geoman.features.importGeoJson
          >[0],
        );
      }
      fitToGeoJson(map, data);
    };
    if (geoman.loaded) {
      applyData();
    } else {
      void geoman.waitForGeomanLoaded().then(applyData);
    }
    return () => {
      isActive = false;
    };
  }, [value]);

  useEffect(() => {
    const geoman = geomanRef.current;
    if (!geoman) {
      return;
    }
    let isActive = true;
    const applyModeState = () => {
      if (!isActive) {
        return;
      }
      if (isReadOnly) {
        geoman.disableAllModes();
        geoman.removeControls();
        return;
      }
      void geoman.addControls();
    };
    if (geoman.loaded) {
      applyModeState();
    } else {
      void geoman.waitForGeomanLoaded().then(applyModeState);
    }
    return () => {
      isActive = false;
    };
  }, [isReadOnly]);

  useEffect(() => {
    const map = mapRef.current;
    const geoman = geomanRef.current;
    if (!map || !geoman || !onChange) {
      return;
    }
    const handleUpdate = () => {
      const geoJson = geoman.features.exportGeoJson();
      const serialized = serializeGeoJson(geoJson);
      lastEmittedGeoJsonRef.current = serialized;
      onChange(geoJson);
    };
    const events = [
      "gm:create",
      "gm:remove",
      "gm:drag",
      "gm:change",
      "gm:rotate",
      "gm:scale",
      "gm:cut",
      "gm:split",
      "gm:union",
      "gm:difference",
      "gm:line_simplification",
      "gm:delete",
    ] as const;
    events.forEach((eventName) =>
      map.on(eventName, handleUpdate as maplibregl.EventedListener),
    );
    return () => {
      events.forEach((eventName) =>
        map.off(eventName, handleUpdate as maplibregl.EventedListener),
      );
    };
  }, [onChange]);

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

function buildGeomanOptions(colors: typeof LIGHT_COLORS): GmOptionsPartial {
  return {
    settings: {
      controlsPosition: "top-left",
    },
    layerStyles: {
      polygon: {
        paint: {
          "fill-color": colors.fill,
          "fill-outline-color": colors.line,
        },
      },
      line: {
        paint: {
          "line-color": colors.line,
        },
      },
      point: {
        paint: {
          "circle-color": colors.point,
          "circle-stroke-color": colors.pointStroke,
        },
      },
    },
  };
}

function isEmptyGeoJson(
  data: maplibregl.GeoJSONSourceSpecification["data"],
): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    data["type"] === "FeatureCollection" &&
    Array.isArray(data["features"]) &&
    data["features"].length === 0
  );
}

function serializeGeoJson(
  data: maplibregl.GeoJSONSourceSpecification["data"],
): string {
  return JSON.stringify(data);
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
