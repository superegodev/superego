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
  const [image, setImage] = useState<{
    content: Uint8Array<ArrayBuffer> | Blob;
    mimeType: `image/${string}`;
  } | null>(() =>
    "content" in file
      ? { mimeType: file.mimeType, content: file.content }
      : null,
  );

  useEffect(() => {
    if ("content" in file) {
      setImage({
        mimeType: file.mimeType,
        content: file.content,
      });
      return;
    }
    let cancelled = false;
    (async () => {
      const { success, data } = await backend.files.getContent(
        file.id as FileId,
      );
      if (!cancelled && success) {
        setImage({
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
