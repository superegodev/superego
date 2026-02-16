import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import classnames from "../../../utils/classnames.js";
import Image from "../Image/Image.js";
import Controls from "./Controls.js";
import useMinScale from "./useMinScale.js";
import * as cs from "./ZoomableImage.css.js";

interface Props {
  image: {
    mimeType: `image/${string}`;
    content: Uint8Array<ArrayBuffer> | Blob;
  } | null;
  alt: string;
  className?: string | undefined;
}
export default function ZoomableImage({ image, alt, className }: Props) {
  const { imgRef, containerRef, minScale } = useMinScale();
  return (
    <div
      ref={containerRef}
      className={classnames(cs.ZoomableImage.root, className)}
    >
      <TransformWrapper
        centerOnInit={true}
        limitToBounds={true}
        minScale={minScale}
      >
        <Controls minScale={minScale} />
        <TransformComponent wrapperClass={cs.ZoomableImage.wrapper}>
          <Image
            ref={imgRef}
            image={image}
            alt={alt}
            className={cs.ZoomableImage.image}
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
