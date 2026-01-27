import type { FileId, MessageContentPart } from "@superego/backend";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import useBackend from "../../../../business-logic/backend/useBackend.js";
import { electronMainWorld } from "../../../../business-logic/electron/electron.js";
import downloadFile from "../../../../utils/downloadFile.js";
import openFileWithNativeApp from "../../../../utils/openFileWithNativeApp.js";
import FileIcon from "../../../design-system/FileIcon/FileIcon.js";
import IconButton from "../../../design-system/IconButton/IconButton.js";
import * as cs from "./UserMessage.css.js";

interface Props {
  filePart: MessageContentPart.File;
}
export default function FilePart({ filePart }: Props) {
  const intl = useIntl();
  const backend = useBackend();

  const { file } = filePart;
  const isImage = file.mimeType.startsWith("image/");
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!isImage) {
      return;
    }
    (async () => {
      const content =
        "id" in file
          ? (await backend.files.getContent(file.id as FileId)).data
          : file.content;
      if (!content) {
        return;
      }
      const url = URL.createObjectURL(
        new Blob([content], { type: file.mimeType }),
      );
      setImgSrc(url);
    })();
  }, [backend, file, isImage]);

  useEffect(() => {
    if (imgSrc) {
      return () => URL.revokeObjectURL(imgSrc);
    }
    return;
  }, [imgSrc]);

  return (
    <IconButton
      variant="invisible"
      onPress={() =>
        electronMainWorld.isElectron && "id" in file
          ? openFileWithNativeApp(intl, file)
          : downloadFile(intl, backend, file)
      }
      label={intl.formatMessage({ defaultMessage: "Download" })}
      className={cs.FilePart.root}
    >
      {isImage ? (
        imgSrc ? (
          <img src={imgSrc} alt={file.name} className={cs.FilePart.image} />
        ) : (
          <div className={cs.FilePart.image} />
        )
      ) : (
        <div className={cs.FilePart.file}>
          <div className={cs.FilePart.iconContainer}>
            <FileIcon mimeType={file.mimeType} />
          </div>
          <div className={cs.FilePart.nameContainer}>{filePart.file.name}</div>
        </div>
      )}
    </IconButton>
  );
}
