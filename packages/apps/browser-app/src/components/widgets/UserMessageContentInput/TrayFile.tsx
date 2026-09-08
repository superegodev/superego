import { useEffect, useState } from "react";
import { PiX } from "react-icons/pi";
import { useIntl } from "react-intl";
import FileIcon from "../../design-system/FileIcon/FileIcon.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import * as cs from "./UserMessageContentInput.css.js";

interface Props {
  file: File;
  onRemove: () => void;
  isRemoveDisabled: boolean;
}

export default function TrayFile({ file, onRemove, isRemoveDisabled }: Props) {
  const intl = useIntl();
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(
    null,
  );
  const imageUrl = preview?.file === file ? preview.url : null;

  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      // Object URLs are external resources created after commit and revoked on cleanup.
      // oxlint-disable-next-line react/set-state-in-effect
      setPreview({ file, url });
      return () => URL.revokeObjectURL(url);
    }
    return;
  }, [file]);

  return (
    <div className={cs.TrayFile.root}>
      <div className={cs.TrayFile.iconOrImageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={file.name} className={cs.TrayFile.image} />
        ) : (
          <FileIcon mimeType={file.type} />
        )}
      </div>
      <div className={cs.TrayFile.nameContainer}>
        <div className={cs.TrayFile.nameTruncator}>{file.name}</div>
      </div>
      <div className={cs.TrayFile.removeButtonContainer}>
        <IconButton
          variant="primary"
          onPress={onRemove}
          label={intl.formatMessage({ defaultMessage: "Remove" })}
          isDisabled={isRemoveDisabled}
          className={cs.TrayFile.removeButton}
        >
          <PiX />
        </IconButton>
      </div>
    </div>
  );
}
