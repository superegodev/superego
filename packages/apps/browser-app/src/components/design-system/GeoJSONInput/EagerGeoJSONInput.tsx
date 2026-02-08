import "maplibre-gl/dist/maplibre-gl.css";
import "@geoman-io/maplibre-geoman-free/dist/maplibre-geoman.css";
import { Geoman } from "@geoman-io/maplibre-geoman-free";
import debounce from "debounce";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { GEOJSON_INPUT_ON_CHANGE_DEBOUNCE } from "../../../config.js";
import { dark } from "../../../themes.css.js";
import * as cs from "./GeoJSONInput.css.js";
import type Props from "./Props.js";
import type { GeoJSONFeatureCollection } from "./Props.js";

function getMapStyle(isDark: boolean): maplibregl.StyleSpecification {
  return {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      carto: {
        type: "raster",
        tiles: [
          isDark
            ? "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
            : "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        ],
        tileSize: 256,
        attribution:
          '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: [
      {
        id: "carto-tiles",
        type: "raster",
        source: "carto",
      },
    ],
  };
}

function cleanExportedGeoJson(exported: {
  features: {
    type: unknown;
    geometry: unknown;
    properties: Record<string, unknown>;
  }[];
}): GeoJSONFeatureCollection {
  return {
    type: "FeatureCollection",
    features: (exported.features ?? []).map(
      (f: {
        type: unknown;
        geometry: unknown;
        properties: Record<string, unknown>;
      }) => ({
        type: f.type,
        geometry: f.geometry,
        properties: Object.fromEntries(
          Object.entries(f.properties ?? {}).filter(
            ([key]) => !key.startsWith("__gm"),
          ),
        ),
      }),
    ),
  };
}

export default function EagerGeoJSONInput({
  value,
  onChange,
  onBlur,
  isInvalid = false,
  isReadOnly = false,
  ref,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [hasFocus, setHasFocus] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initialValueRef = useRef(value);
  const isReadOnlyRef = useRef(isReadOnly);

  // The map is initialized once and then uncontrolled, like TiptapInput's editor.
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const isDark = document.body.classList.contains(dark);
    const map = new maplibregl.Map({
      container,
      style: getMapStyle(isDark),
      center: [0, 20],
      zoom: 1,
      attributionControl: false,
    });

    const gm = new Geoman(map, {
      settings: {
        controlsPosition: "top-right",
      },
    });

    map.on("gm:loaded", () => {
      const initialValue = initialValueRef.current;
      if (
        initialValue &&
        initialValue.type === "FeatureCollection" &&
        Array.isArray(initialValue.features) &&
        initialValue.features.length > 0
      ) {
        gm.features.importGeoJson(
          initialValue as Parameters<typeof gm.features.importGeoJson>[0],
        );
      }

      if (!isReadOnlyRef.current) {
        gm.addControls();
      }

      const debouncedOnChange = debounce(() => {
        const exported = gm.features.exportGeoJson();
        onChangeRef.current(
          cleanExportedGeoJson(
            exported as Parameters<typeof cleanExportedGeoJson>[0],
          ),
        );
      }, GEOJSON_INPUT_ON_CHANGE_DEBOUNCE);

      gm.setGlobalEventsListener(() => {
        debouncedOnChange();
      });
    });

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (rootRef.current && ref) {
      ref({
        focus: () => {
          rootRef.current?.focus();
        },
      });
    }
  }, [ref]);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      onFocus={() => setHasFocus(true)}
      onBlur={(evt) => {
        if (!rootRef.current?.contains(evt.relatedTarget)) {
          setHasFocus(false);
          onBlur?.();
        }
      }}
      aria-invalid={isInvalid}
      data-has-focus={hasFocus}
      data-read-only={isReadOnly}
      className={cs.GeoJSONInput.root}
    >
      <div ref={mapContainerRef} className={cs.GeoJSONInput.map} />
    </div>
  );
}
