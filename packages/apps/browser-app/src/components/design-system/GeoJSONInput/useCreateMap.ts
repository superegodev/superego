import { Geoman } from "@geoman-io/maplibre-geoman-free";
import type { Theme } from "@superego/backend";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import type GeoJSONValue from "../../../utils/GeoJSONValue.js";
import getCenterAndZoom from "../../../utils/getCenterAndZoom.js";
import getMapStyle from "../../../utils/getMapStyle.js";

// Create the map and Geoman (on map load). The effect re-runs when `theme`
// changes, tearing down and recreating the map with the new style. Other
// props (value, isReadOnly) are kept in sync by separate hooks.
export default function useCreateMap({
  value,
  isReadOnly,
  theme,
}: {
  value: GeoJSONValue | null | undefined;
  isReadOnly: boolean;
  theme: Theme;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const geomanRef = useRef<Geoman | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainer,
      style: getMapStyle(theme),
      ...getCenterAndZoom(value),
    });
    mapRef.current = map;

    map.on("load", () => {
      if (mapRef.current !== map) {
        return;
      }

      const geoman = new Geoman(map, {
        settings: {
          controlsPosition: "top-left",
        },
      });
      geomanRef.current = geoman;

      map.on("gm:loaded", () => {
        if (mapRef.current !== map) {
          return;
        }

        if (isReadOnly) {
          geoman.removeControls();
        }

        setIsLoaded(true);
      });
    });

    return () => {
      mapRef.current = null;
      geomanRef.current = null;
      setIsLoaded(false);
      map.remove();
    };
  }, [theme]);

  return { mapContainerRef, geomanRef, isLoaded };
}
