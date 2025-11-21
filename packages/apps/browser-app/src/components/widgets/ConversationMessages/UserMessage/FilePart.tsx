import type { MessageContentPart } from "@superego/backend";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import Button from "../../../design-system/Button/Button.js";
import FileIcon from "../../../design-system/FileIcon/FileIcon.js";
import IconButton from "../../../design-system/IconButton/IconButton.js";
import * as cs from "./UserMessage.css.js";

interface Props {
  filePart: MessageContentPart.File;
}
export default function FilePart({ filePart }: Props) {
  const intl = useIntl();

  const { file } = filePart;
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file.contentType.startsWith("image/")) {
      const url = URL.createObjectURL(
        new Blob([file.content], { type: file.contentType }),
      );
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setImageUrl(null);
    return;
  }, [file]);

  return (
    <IconButton
      variant="invisible"
      onPress={() => {
        const blob = new Blob([file.content], { type: file.contentType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.style.display = "none";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
      }}
      label={intl.formatMessage({ defaultMessage: "Download" })}
      className={cs.FilePart.root}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={file.name} className={cs.FilePart.image} />
      ) : (
        <div className={cs.FilePart.file}>
          <div className={cs.FilePart.iconContainer}>
            <FileIcon mimeType={file.contentType} />
          </div>
          <div className={cs.FilePart.nameContainer}>{filePart.file.name}</div>
        </div>
      )}
    </IconButton>
  );
}
