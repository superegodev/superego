import type { MessageContentPart } from "@superego/backend";
import { useIntl } from "react-intl";
import useBackend from "../../../../business-logic/backend/useBackend.jsx";
import downloadFile from "../../../../utils/downloadFile.js";
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

  return (
    <IconButton
      variant="invisible"
      onPress={() => downloadFile(backend, file)}
      label={intl.formatMessage({ defaultMessage: "Download" })}
      className={cs.FilePart.root}
    >
      {/*
      TODO: point to src for image
      {imageUrl ? (
        <img src={imageUrl} alt={file.name} className={cs.FilePart.image} />
      ) : ( */}
      <div className={cs.FilePart.file}>
        <div className={cs.FilePart.iconContainer}>
          <FileIcon mimeType={file.mimeType} />
        </div>
        <div className={cs.FilePart.nameContainer}>{filePart.file.name}</div>
      </div>
      {/* )} */}
    </IconButton>
  );
}
