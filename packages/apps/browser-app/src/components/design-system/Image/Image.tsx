import { useEffect, useState } from "react";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Image.css.js";

interface Props {
  image: {
    mimeType: `image/${string}`;
    content: Uint8Array<ArrayBuffer>;
  } | null;
  alt: string;
  className?: string | undefined;
}
export default function Image({ image, alt, className }: Props) {
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
    <img src={src} alt={alt} className={className} />
  ) : (
    <div className={classnames(cs.Image.placeholder, className)} />
  );
}
