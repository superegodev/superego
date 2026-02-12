import "maplibre-gl/dist/maplibre-gl.css";
import "@geoman-io/maplibre-geoman-free/dist/maplibre-geoman.css";
import { Geoman } from "@geoman-io/maplibre-geoman-free";
import debounce from "debounce";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { useFocusVisible } from "react-aria";
import useTheme from "../../../business-logic/theme/useTheme.js";
import { GEOJSON_INPUT_ON_CHANGE_DEBOUNCE } from "../../../config.js";
import isEmpty from "../../../utils/isEmpty.js";
import cleanExportedGeoJson from "./cleanExportedGeoJson.js";
import * as cs from "./GeoJSONInput.css.js";
import getMapStyle from "./getMapStyle.js";
import type Props from "./Props.js";
import wrapAsFeatureCollection from "./wrapAsFeatureCollection.js";

export default function EagerGeoJSONInput({
  value,
  onChange,
  onBlur,
  isInvalid = false,
  isReadOnly = false,
  ref,
}: Props) {
  const { isFocusVisible } = useFocusVisible();
  const [hasFocus, setHasFocus] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const geomanRef = useRef<Geoman | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const theme = useTheme();

  // Main initialization effect. Creates the map and Geoman instance. Props
  // consumed at creation time (value, onChange, isReadOnly, theme) are kept in
  // sync by separate effects below.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainer,
      style: getMapStyle(theme),
      center: [0, 20],
      zoom: 1,
      attributionControl: false,
    });
    mapRef.current = map;

    const geoman = new Geoman(map, {
      settings: {
        controlsPosition: "top-right",
      },
    });
    geomanRef.current = geoman;

    map.on("gm:loaded", () => {
      if (value) {
        const featureCollection = wrapAsFeatureCollection(value);
        if (!isEmpty(featureCollection.features)) {
          geoman.features.importGeoJson(
            featureCollection as Parameters<
              typeof geoman.features.importGeoJson
            >[0],
          );
        }
      }

      if (!isReadOnly) {
        geoman.addControls();
      }

      geoman.setGlobalEventsListener(
        debounce(() => {
          const exported = geoman.features.exportGeoJson();
          onChange(
            cleanExportedGeoJson(
              exported as Parameters<typeof cleanExportedGeoJson>[0],
            ),
          );
        }, GEOJSON_INPUT_ON_CHANGE_DEBOUNCE),
      );

      setIsLoaded(true);
    });

    return () => {
      mapRef.current = null;
      geomanRef.current = null;
      setIsLoaded(false);
      map.remove();
    };
  }, []);

  // Sync onChange: re-register the global events listener when onChange
  // changes.
  useEffect(() => {
    const geoman = geomanRef.current;
    if (!isLoaded || !geoman) {
      return;
    }

    geoman.setGlobalEventsListener(
      debounce(() => {
        const exported = geoman.features.exportGeoJson();
        onChange(
          cleanExportedGeoJson(
            exported as Parameters<typeof cleanExportedGeoJson>[0],
          ),
        );
      }, GEOJSON_INPUT_ON_CHANGE_DEBOUNCE),
    );

    return () => {
      geoman.setGlobalEventsListener(null);
    };
  }, [onChange, isLoaded]);

  // Sync value: when the value changes externally, re-import into Geoman.
  useEffect(() => {
    const geoman = geomanRef.current;
    if (!isLoaded || !geoman) {
      return;
    }

    const currentExport = cleanExportedGeoJson(
      geoman.features.exportGeoJson() as Parameters<
        typeof cleanExportedGeoJson
      >[0],
    );
    const currentSerialized = JSON.stringify(currentExport);
    const incomingSerialized = value ? JSON.stringify(value) : null;

    if (currentSerialized === incomingSerialized) {
      return;
    }

    geoman.features.deleteAll();

    if (value) {
      const featureCollection = wrapAsFeatureCollection(value);
      if (!isEmpty(featureCollection.features)) {
        geoman.features.importGeoJson(
          featureCollection as Parameters<
            typeof geoman.features.importGeoJson
          >[0],
        );
      }
    }
  }, [value, isLoaded]);

  // Sync isReadOnly: add or remove Geoman controls.
  useEffect(() => {
    const geoman = geomanRef.current;
    if (!isLoaded || !geoman) {
      return;
    }

    if (isReadOnly) {
      geoman.removeControls();
    } else {
      geoman.addControls();
    }
  }, [isReadOnly, isLoaded]);

  // Sync theme: update the map basemap style. MapLibre's setStyle destroys
  // Geoman's layers, so we export features first and re-import after the new
  // style loads.
  useEffect(() => {
    const map = mapRef.current;
    const geoman = geomanRef.current;
    if (!isLoaded || !map || !geoman) {
      return;
    }

    const exported = geoman.features.exportGeoJson();

    map.setStyle(getMapStyle(theme));
    map.once("style.load", () => {
      geoman.features.importGeoJson(
        exported as Parameters<typeof geoman.features.importGeoJson>[0],
      );
    });
  }, [theme, isLoaded]);

  // Ref callback for react-hook-form focus.
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
      data-focus-visible={hasFocus && isFocusVisible}
      data-read-only={isReadOnly}
      className={cs.GeoJSONInput.root}
    >
      <div ref={mapContainerRef} className={cs.GeoJSONInput.map} />
    </div>
  );
}
