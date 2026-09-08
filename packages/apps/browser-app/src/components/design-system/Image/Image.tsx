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
  const [imageUrl, setImageUrl] = useState<{
    image: Props["image"];
    url: string;
  } | null>(null);
  const src = imageUrl?.image === image ? imageUrl?.url : null;

  useEffect(() => {
    if (!image) {
      return;
    }
    const url = URL.createObjectURL(
      new Blob([image.content], { type: image.mimeType }),
    );
    // Object URLs are external resources created after commit and revoked on cleanup.
    // oxlint-disable-next-line react/set-state-in-effect
    setImageUrl({ image, url });
    return () => URL.revokeObjectURL(url);
  }, [image]);

  return src ? (
    <img ref={ref} src={src} alt={alt} className={className} />
  ) : (
    <div className={classnames(cs.Image.placeholder, className)} />
  );
}
