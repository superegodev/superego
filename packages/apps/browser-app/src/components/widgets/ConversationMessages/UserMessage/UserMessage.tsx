import {
  type AudioContent,
  type Message,
  type MessageContentPart,
  MessageContentPartType,
} from "@superego/backend";
import { PiPause, PiSpeakerSimpleHigh } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import usePlayAudio from "../../../../business-logic/audio/usePlayAudio.js";
import CopyButton from "../../../design-system/CopyButton/CopyButton.js";
import IconButton from "../../../design-system/IconButton/IconButton.js";
import Markdown from "../../../design-system/Markdown/Markdown.jsx";
import FileParts from "./FileParts.js";
import * as cs from "./UserMessage.css.js";

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
    (part): part is MessageContentPart & { audio: AudioContent } =>
      "audio" in part && part.audio !== undefined,
  );
  const fileParts = message.content.filter(
    (part) => part.type === MessageContentPartType.File,
  );

  const { isPlaying, togglePlayback } = usePlayAudio(partWithAudio?.audio);
  return (
    <>
      <FileParts fileParts={fileParts} />
      <div className={cs.UserMessage.root}>
        {text !== "" ? (
          <Markdown text={text} className={cs.UserMessage.markdown} />
        ) : (
          <FormattedMessage defaultMessage="Transcribing audio..." />
        )}
        <div className={cs.UserMessage.actions}>
          {text !== "" ? (
            <CopyButton text={text} className={cs.UserMessage.action} />
          ) : null}
          {partWithAudio ? (
            <IconButton
              label={
                isPlaying
                  ? intl.formatMessage({ defaultMessage: "Pause" })
                  : intl.formatMessage({ defaultMessage: "Play" })
              }
              variant="invisible"
              className={cs.UserMessage.action}
              onPress={togglePlayback}
            >
              {isPlaying ? <PiPause /> : <PiSpeakerSimpleHigh />}
            </IconButton>
          ) : null}
        </div>
      </div>
    </>
  );
}
