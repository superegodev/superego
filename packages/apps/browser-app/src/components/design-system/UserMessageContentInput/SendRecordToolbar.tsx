import { Toolbar } from "react-aria-components";
import {
  PiMicrophoneFill,
  PiPaperPlaneRightFill,
  PiStopFill,
  PiX,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import IconButton from "../IconButton/IconButton.js";
import * as cs from "./UserMessageContentInput.css.js";

interface Props {
  isWriting: boolean;
  isRecording: boolean;
  onSend: () => void;
  onStartRecording: () => void;
  onStopRecordingAndSend: () => void;
  onCancelRecording: () => void;
}
export default function SendRecordToolbar({
  isWriting,
  isRecording,
  onSend,
  onStartRecording,
  onStopRecordingAndSend,
  onCancelRecording,
}: Props) {
  const intl = useIntl();
  return (
    <Toolbar className={cs.SendRecordToolbar.root}>
      {isRecording ? (
        <IconButton
          variant="invisible"
          label={intl.formatMessage({ defaultMessage: "Cancel" })}
          className={cs.SendRecordToolbar.button}
          onPress={onCancelRecording}
        >
          <PiX />
        </IconButton>
      ) : null}
      <IconButton
        variant="invisible"
        label={
          isWriting
            ? intl.formatMessage({ defaultMessage: "Send" })
            : isRecording
              ? intl.formatMessage({ defaultMessage: "Finish and send" })
              : intl.formatMessage({ defaultMessage: "Record" })
        }
        className={cs.SendRecordToolbar.button}
        onPress={
          isWriting
            ? onSend
            : isRecording
              ? onStopRecordingAndSend
              : onStartRecording
        }
      >
        {isWriting ? (
          <PiPaperPlaneRightFill />
        ) : isRecording ? (
          <PiStopFill />
        ) : (
          <PiMicrophoneFill />
        )}
      </IconButton>
    </Toolbar>
  );
}
