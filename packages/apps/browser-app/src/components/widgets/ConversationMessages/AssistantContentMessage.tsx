import type { Message } from "@superego/backend";
import Markdown from "markdown-to-jsx";
import { useEffect } from "react";
import { PiPauseFill, PiPlayFill } from "react-icons/pi";
import { useIntl } from "react-intl";
import IconButton from "../../design-system/IconButton/IconButton.jsx";
import * as cs from "./ConversationMessages.css.js";
import useAudio from "./useAudio.js";

interface Props {
  message: Message.ContentAssistant;
}
export default function AssistantContentMessage({ message }: Props) {
  const intl = useIntl();

  const [textPart] = message.content;
  const { isPlaying, togglePlayback } = useAudio(textPart?.audio);

  // Autoplay the last message.
  useEffect(() => {
    if (Date.now() - message.createdAt.getTime() < 1_000) {
      togglePlayback();
    }
  }, [message, togglePlayback]);
  return (
    <div className={cs.AssistantContentMessage.root}>
      <Markdown
        key={textPart.text}
        options={{
          overrides: {
            iframe: () => null,
            a: { props: { target: "_blank", rel: "noopener noreferrer" } },
          },
        }}
      >
        {textPart.text}
      </Markdown>
      {textPart.audio ? (
        <IconButton
          label={
            isPlaying
              ? intl.formatMessage({ defaultMessage: "Pause" })
              : intl.formatMessage({ defaultMessage: "Play" })
          }
          variant="default"
          className={cs.AssistantContentMessage.playPauseButton}
          onPress={togglePlayback}
        >
          {isPlaying ? <PiPauseFill /> : <PiPlayFill />}
        </IconButton>
      ) : null}
    </div>
  );
}
