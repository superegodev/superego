import type { FileId } from "@superego/backend";
import type { FileRef } from "@superego/schema";
import { type CSSProperties, useEffect, useState } from "react";
import useBackend from "../../business-logic/backend/useBackend.js";
import * as cs from "./Image.css.js";

interface Props {
  image: FileRef & { mimeType: `image/${string}` };
  style?: CSSProperties | undefined;
}
export default function Image({ image, style }: Props) {
  const backend = useBackend();
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const content = (await backend.getFileContent(image.id as FileId)).data;
      if (!content) {
        return;
      }
      const url = URL.createObjectURL(
        new Blob([content], { type: image.mimeType }),
      );
      setImgSrc(url);
    })();
  }, [backend, image]);

  useEffect(() => {
    if (imgSrc) {
      return () => URL.revokeObjectURL(imgSrc);
    }
    return;
  }, [imgSrc]);

  return imgSrc ? (
    <img src={imgSrc} alt={image.name} style={style} />
  ) : (
    <div className={cs.Image.placeholder} style={style} />
  );
}
