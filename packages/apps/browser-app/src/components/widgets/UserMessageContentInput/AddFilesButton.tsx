import { FileTrigger } from "react-aria-components";
import { PiPaperclip } from "react-icons/pi";
import { useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import IconLink from "../../design-system/IconLink/IconLink.jsx";
import * as cs from "./UserMessageContentInput.css.js";

interface Props {
  onFilesAdded: (files: FileList) => void;
  isDisabled: boolean;
  isFileInspectionConfigured: boolean;
}
export default function AddFilesButton({
  onFilesAdded,
  isDisabled,
  isFileInspectionConfigured,
}: Props) {
  const intl = useIntl();
  return isFileInspectionConfigured ? (
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
        className={cs.AddFilesButton.button}
        isDisabled={isDisabled}
      >
        <PiPaperclip />
      </IconButton>
    </FileTrigger>
  ) : (
    <IconLink
      variant="invisible"
      label={intl.formatMessage({
        defaultMessage: "Configure assistant for file inspection",
      })}
      to={{ name: RouteName.GlobalSettings }}
      className={cs.AddFilesButton.disabledLookingButton}
      tooltipDelay={0}
    >
      <PiPaperclip />
    </IconLink>
  );
}
