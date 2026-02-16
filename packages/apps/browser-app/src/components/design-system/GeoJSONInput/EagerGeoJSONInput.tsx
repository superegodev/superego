import "maplibre-gl/dist/maplibre-gl.css";
import "@geoman-io/maplibre-geoman-free/dist/maplibre-geoman.css";
import { useEffect, useRef, useState } from "react";
import { useFocusVisible } from "react-aria";
import useTheme from "../../../business-logic/theme/useTheme.js";
import classnames from "../../../utils/classnames.js";
import * as cs from "./GeoJSONInput.css.js";
import type Props from "./Props.js";
import useCreateMap from "./useCreateMap.js";
import useSyncReadOnly from "./useSyncReadOnly.js";

import useSyncValue from "./useSyncValue.js";

export default function EagerGeoJSONInput({
  value,
  onChange,
  onBlur,
  isInvalid = false,
  isReadOnly = false,
  ref,
  className,
}: Props) {
  const { isFocusVisible } = useFocusVisible();
  const [hasFocus, setHasFocus] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const { mapContainerRef, geomanRef, isLoaded } = useCreateMap({
    value,
    isReadOnly,
    theme,
  });

  useSyncValue({ geomanRef, isLoaded, value, onChange });
  useSyncReadOnly({ geomanRef, isLoaded, isReadOnly });

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
      className={classnames(cs.GeoJSONInput.root, className)}
    >
      <div
        ref={mapContainerRef}
        data-loaded={isLoaded}
        className={cs.GeoJSONInput.map}
      />
    </div>
  );
}
