import { type Message, MessageContentPartType } from "@superego/backend";
import { PiPauseFill, PiPlayFill } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import IconButton from "../../design-system/IconButton/IconButton.js";
import * as cs from "./ConversationMessages.css.js";
import useAudio from "./useAudio.js";

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
  const { isPlaying, togglePlayback } = useAudio(partWithAudio?.audio);
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
          variant="default"
          className={cs.UserMessage.playPauseButton}
          onPress={togglePlayback}
        >
          {isPlaying ? <PiPauseFill /> : <PiPlayFill />}
        </IconButton>
      ) : null}
    </div>
  );
}
