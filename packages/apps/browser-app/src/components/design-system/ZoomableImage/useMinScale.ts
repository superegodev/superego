import { type RefCallback, useCallback, useRef, useState } from "react";

interface UseMinScale {
  imgRef: RefCallback<HTMLImageElement>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  minScale: number;
}
export default function useMinScale(): UseMinScale {
  const containerRef = useRef<HTMLDivElement>(null);
  const [minScale, setMinScale] = useState(1);

  const imgRef: RefCallback<HTMLImageElement> = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) {
        return;
      }

      const handleLoad = () => {
        const container = containerRef.current;
        if (!container) {
          return;
        }
        setMinScale(
          (container.clientHeight * img.naturalWidth) /
            (container.clientWidth * img.naturalHeight),
        );
      };

      img.addEventListener("load", handleLoad);

      if (img.complete && img.naturalWidth) {
        handleLoad();
      }

      return () => img.removeEventListener("load", handleLoad);
    },
    [],
  );

  return { imgRef, containerRef, minScale };
}
