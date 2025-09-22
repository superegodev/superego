import { type Message, MessageContentPartType } from "@superego/backend";
import { PiPauseFill, PiSpeakerSimpleHighFill } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import usePlayAudio from "../../../business-logic/audio/usePlayAudio.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  message: Message.User;
}
export default function UserMessage({ message }: Props) {
  const intl = useIntl();
  const text = message.content
    .filter((part) => part.type === MessageContentPartType.Text)
    .map((part) => part.text)
    .join("\n\n");
  const partWithAudio = message.content.find(
    (part) => part.audio !== undefined,
  );
  const { isPlaying, togglePlayback } = usePlayAudio(partWithAudio?.audio);
  return (
    <div className={cs.UserMessage.root}>
      {text !== "" ? (
        text
      ) : (
        <FormattedMessage defaultMessage="Transcribing audio..." />
      )}
      {partWithAudio ? (
        <IconButton
          label={
            isPlaying
              ? intl.formatMessage({ defaultMessage: "Pause" })
              : intl.formatMessage({ defaultMessage: "Play" })
          }
          variant="primary"
          className={cs.UserMessage.playPauseButton}
          onPress={togglePlayback}
        >
          {isPlaying ? <PiPauseFill /> : <PiSpeakerSimpleHighFill />}
        </IconButton>
      ) : null}
    </div>
  );
}
