import { Toolbar } from "react-aria-components";
import {
  PiGear,
  PiMicrophoneFill,
  PiPaperPlaneRightFill,
  PiStopFill,
  PiX,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import IconLink from "../../design-system/IconLink/IconLink.js";
import * as cs from "./UserMessageContentInput.css.js";

interface Props {
  areChatCompletionsConfigured: boolean;
  isWriting: boolean;
  isRecording: boolean;
  isDisabled: boolean;
  onSend: () => void;
  onStartRecording: () => void;
  onFinishRecording: () => void;
  onCancelRecording: () => void;
}
export default function SendRecordButtons({
  areChatCompletionsConfigured,
  isWriting,
  isRecording,
  isDisabled,
  onSend,
  onStartRecording,
  onFinishRecording,
  onCancelRecording,
}: Props) {
  const intl = useIntl();
  return (
    <Toolbar className={cs.SendRecordButtons.root}>
      {isRecording ? (
        <IconButton
          variant="invisible"
          label={intl.formatMessage({ defaultMessage: "Cancel" })}
          onPress={onCancelRecording}
          isDisabled={isDisabled}
          className={cs.SendRecordButtons.button}
        >
          <PiX />
        </IconButton>
      ) : null}
      {areChatCompletionsConfigured && !isWriting ? (
        <IconButton
          variant="invisible"
          label={
            isRecording
              ? intl.formatMessage({ defaultMessage: "Finish and send" })
              : intl.formatMessage({ defaultMessage: "Record" })
          }
          onPress={isRecording ? onFinishRecording : onStartRecording}
          isDisabled={isDisabled}
          className={cs.SendRecordButtons.button}
        >
          {isRecording ? <PiStopFill /> : <PiMicrophoneFill />}
        </IconButton>
      ) : null}
      {!areChatCompletionsConfigured ? (
        <IconLink
          variant="invisible"
          label={intl.formatMessage({ defaultMessage: "Configure assistant" })}
          to={{ name: RouteName.GlobalSettings }}
          className={cs.SendRecordButtons.button}
          tooltipDelay={0}
        >
          <PiGear />
        </IconLink>
      ) : null}
      {areChatCompletionsConfigured && isWriting ? (
        <IconButton
          variant="invisible"
          label={intl.formatMessage({ defaultMessage: "Send" })}
          onPress={onSend}
          isDisabled={!isWriting || isDisabled}
          className={cs.SendRecordButtons.button}
        >
          <PiPaperPlaneRightFill />
        </IconButton>
      ) : null}
    </Toolbar>
  );
}
