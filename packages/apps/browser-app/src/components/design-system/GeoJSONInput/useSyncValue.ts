import type { Geoman } from "@geoman-io/maplibre-geoman-free";
import debounce from "debounce";
import { type RefObject, useEffect } from "react";
import { GEOJSON_INPUT_ON_CHANGE_DEBOUNCE } from "../../../config.js";
import isEmpty from "../../../utils/isEmpty.js";
import type GeoJSONFeatureCollection from "./GeoJSONFeatureCollection.js";
import type Props from "./Props.js";
import wrapAsFeatureCollection from "./wrapAsFeatureCollection.js";

export default function useSyncValue({
  geomanRef,
  isLoaded,
  value,
  onChange,
}: {
  geomanRef: RefObject<Geoman | null>;
  isLoaded: boolean;
  value: Props["value"];
  onChange: Props["onChange"];
}) {
  // Sync onChange: re-register the global events listener when onChange
  // changes.
  // refs are stable, .current is read not tracked.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    const geoman = geomanRef.current;
    if (!isLoaded || !geoman) {
      return;
    }

    geoman.setGlobalEventsListener(
      debounce(() => {
        onChange(geoman.features.exportGeoJson() as GeoJSONFeatureCollection);
      }, GEOJSON_INPUT_ON_CHANGE_DEBOUNCE),
    );

    return () => {
      geoman.setGlobalEventsListener(null);
    };
  }, [onChange, isLoaded]);

  // Sync value: when the value changes externally, re-import into Geoman.
  // refs are stable, .current is read not tracked.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    const geoman = geomanRef.current;
    if (!isLoaded || !geoman) {
      return;
    }

    const currentSerialized = JSON.stringify(geoman.features.exportGeoJson());
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
}
