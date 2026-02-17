import { type Ref, useEffect, useState } from "react";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Image.css.js";

interface Props {
  image: {
    mimeType: `image/${string}`;
    content: Uint8Array<ArrayBuffer> | Blob;
  } | null;
  alt: string;
  className?: string | undefined;
  ref?: Ref<HTMLImageElement>;
}
export default function Image({ image, alt, className, ref }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setSrc(null);
      return;
    }
    const url = URL.createObjectURL(
      new Blob([image.content], { type: image.mimeType }),
    );
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  return src ? (
    <img ref={ref} src={src} alt={alt} className={className} />
  ) : (
    <div className={classnames(cs.Image.placeholder, className)} />
  );
}
