import type { Backend, FileId } from "@superego/backend";
import type { FileRef, RHFProtoFile } from "@superego/schema";
import { useEffect, useState } from "react";
import ZoomableImage from "../../design-system/ZoomableImage/ZoomableImage.js";

interface Props {
  file: (RHFProtoFile | FileRef) & { mimeType: `image/${string}` };
  backend: Backend;
  className?: string;
}
export default function FileImage({ file, backend, className }: Props) {
  const [loadedImage, setLoadedImage] = useState<{
    file: Props["file"];
    content: Uint8Array<ArrayBuffer> | Blob;
    mimeType: `image/${string}`;
  } | null>(null);
  const image =
    "content" in file ? file : loadedImage?.file === file ? loadedImage : null;

  useEffect(() => {
    if ("content" in file) {
      return;
    }
    let cancelled = false;
    (async () => {
      const { success, data } = await backend.files.getContent(
        file.id as FileId,
      );
      if (!cancelled && success) {
        setLoadedImage({
          file,
          mimeType: file.mimeType,
          content: data,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, backend]);

  return <ZoomableImage image={image} alt={file.name} className={className} />;
}
