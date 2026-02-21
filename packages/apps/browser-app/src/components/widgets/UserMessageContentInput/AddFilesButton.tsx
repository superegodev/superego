import { FileTrigger } from "react-aria-components";
import { PiPaperclip } from "react-icons/pi";
import { useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import IconLink from "../../design-system/IconLink/IconLink.js";
import * as cs from "./UserMessageContentInput.css.js";

interface Props {
  onFilesAdded: (files: FileList) => void;
  isDisabled: boolean;
  isChatCompletionsConfigured: boolean;
}
export default function AddFilesButton({
  onFilesAdded,
  isDisabled,
  isChatCompletionsConfigured,
}: Props) {
  const intl = useIntl();
  return isChatCompletionsConfigured ? (
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
        defaultMessage: "Configure assistant",
      })}
      to={{ name: RouteName.GlobalSettings }}
      className={cs.AddFilesButton.disabledLookingButton}
      tooltipDelay={0}
    >
      <PiPaperclip />
    </IconLink>
  );
}
