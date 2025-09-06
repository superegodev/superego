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
  isLastMessage: boolean;
}
export default function AssistantContentMessage({
  message,
  isLastMessage,
}: Props) {
  const intl = useIntl();

  const [textPart] = message.content;
  const { isPlaying, togglePlayback } = useAudio(textPart?.audio);

  // Autoplay the last message.
  useEffect(() => {
    if (isLastMessage && Date.now() - message.createdAt.getTime() < 10_000) {
      togglePlayback();
    }
  }, [message, togglePlayback, isLastMessage]);
  return (
    <div className={cs.AssistantContentMessage.root}>
      {textPart.audio ? (
        <IconButton
          label={
            isPlaying
              ? intl.formatMessage({ defaultMessage: "Pause" })
              : intl.formatMessage({ defaultMessage: "Play" })
          }
          variant="primary"
          onPress={togglePlayback}
          className={cs.AssistantContentMessage.playPauseButton}
        >
          {isPlaying ? <PiPauseFill /> : <PiPlayFill />}
        </IconButton>
      ) : null}
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
    </div>
  );
}
