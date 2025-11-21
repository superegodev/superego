import { FileTrigger } from "react-aria-components";
import { PiPaperclip } from "react-icons/pi";
import { useIntl } from "react-intl";
import IconButton from "../../design-system/IconButton/IconButton.js";
import * as cs from "./UserMessageContentInput.css.js";

interface Props {
  onFilesAdded: (files: FileList) => void;
  isDisabled: boolean;
}
export default function AddFilesButton({ onFilesAdded, isDisabled }: Props) {
  const intl = useIntl();
  return (
    <FileTrigger
      onSelect={(files) => {
        if (files) {
          onFilesAdded(files);
        }
      }}
      allowsMultiple={true}
    >
      <IconButton
        variant="invisible"
        label={intl.formatMessage({ defaultMessage: "Add file" })}
        className={cs.AddFilesButton.root}
        isDisabled={isDisabled}
      >
        <PiPaperclip />
      </IconButton>
    </FileTrigger>
  );
}
