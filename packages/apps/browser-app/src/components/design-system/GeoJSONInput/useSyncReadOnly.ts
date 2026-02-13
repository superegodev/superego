import type { Geoman } from "@geoman-io/maplibre-geoman-free";
import { type RefObject, useEffect, useRef } from "react";

export default function useSyncReadOnly({
  geomanRef,
  isLoaded,
  isReadOnly,
}: {
  geomanRef: RefObject<Geoman | null>;
  isLoaded: boolean;
  isReadOnly: boolean;
}) {
  const appliedIsReadOnlyRef = useRef(isReadOnly);

  // refs are stable, .current is read not tracked.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    const geoman = geomanRef.current;
    if (!isLoaded || !geoman) {
      return;
    }

    if (appliedIsReadOnlyRef.current === isReadOnly) {
      return;
    }
    appliedIsReadOnlyRef.current = isReadOnly;

    if (isReadOnly) {
      geoman.removeControls();
    } else {
      geoman.addControls();
    }
  }, [isReadOnly, isLoaded]);
}
