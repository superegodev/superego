import type { Geoman } from "@geoman-io/maplibre-geoman-free";
import debounce from "debounce";
import { type RefObject, useEffect, useRef } from "react";
import { GEOJSON_INPUT_ON_CHANGE_DEBOUNCE } from "../../../config.js";
import isEmpty from "../../../utils/isEmpty.js";
import type GeoJSONFeatureCollection from "./GeoJSONFeatureCollection.js";
import type Props from "./Props.js";
import wrapAsFeatureCollection from "./wrapAsFeatureCollection.js";

// The GeoJSONInput component wraps the Geoman map editor, which manages its own
// internal state. The `value` prop is used both for the initial value and for
// ongoing synchronization (e.g., when the form resets after an external change,
// or when the nullify button sets it to `null`).
//
// Because `onChange` is debounced, there is a window where the editor's
// internal state is ahead of the form value. If the form refreshes the `value`
// prop during this window (e.g., after an auto-save), the component would
// overwrite the user's in-flight edits with the stale saved value.
//
// To prevent this, the component tracks whether it has "pending local changes"
// — changes that exist in the editor but have not yet been flushed to
// `onChange`. While pending local changes exist, incoming `value` prop updates
// are ignored — except for `null`, which is always accepted (for the nullify
// button).
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
  const hasPendingLocalChangesRef = useRef(false);

  // Sync onChange: re-register the global events listener when onChange
  // changes.
  // refs are stable, .current is read not tracked.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    const geoman = geomanRef.current;
    if (!isLoaded || !geoman) {
      return;
    }

    const debouncedOnChange = debounce(() => {
      hasPendingLocalChangesRef.current = false;
      onChange(geoman.features.exportGeoJson() as GeoJSONFeatureCollection);
    }, GEOJSON_INPUT_ON_CHANGE_DEBOUNCE);
    const listener = () => {
      hasPendingLocalChangesRef.current = true;
      debouncedOnChange();
    };
    geoman.setGlobalEventsListener(listener);

    return () => {
      debouncedOnChange.clear();
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

    if (!value) {
      hasPendingLocalChangesRef.current = false;
      geoman.features.deleteAll();
      return;
    }

    if (hasPendingLocalChangesRef.current) {
      return;
    }

    const currentSerialized = JSON.stringify(geoman.features.exportGeoJson());
    const incomingSerialized = JSON.stringify(value);

    if (currentSerialized === incomingSerialized) {
      return;
    }

    geoman.features.deleteAll();

    const featureCollection = wrapAsFeatureCollection(value);
    if (!isEmpty(featureCollection.features)) {
      geoman.features.importGeoJson(
        featureCollection as Parameters<
          typeof geoman.features.importGeoJson
        >[0],
      );
    }
  }, [value, isLoaded]);
}
