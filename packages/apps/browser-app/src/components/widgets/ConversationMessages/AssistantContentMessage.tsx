import type { AudioContent, Conversation, Message } from "@superego/backend";
import Markdown from "markdown-to-jsx";
import { useEffect, useRef, useState } from "react";
import {
  PiPauseFill,
  PiSpeakerSimpleHighFill,
  PiSpinnerGap,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import usePlayAudio from "../../../business-logic/audio/usePlayAudio.js";
import { useTts } from "../../../business-logic/backend/hooks.js";
import IconButton from "../../design-system/IconButton/IconButton.jsx";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  message: Message.ContentAssistant;
  conversation: Conversation;
}
export default function AssistantContentMessage({ message }: Props) {
  const intl = useIntl();

  const isMutatingRef = useRef(false);
  const [audio, setAudio] = useState<AudioContent | null>(null);
  const { mutate, isPending } = useTts();

  const [textPart] = message.content;
  const { isPlaying, togglePlayback } = usePlayAudio(audio);

  // Play when we get the audio. (Having gotten the audio means that there was
  // a request to play the message.)
  useEffect(() => {
    togglePlayback();
  }, [togglePlayback]);

  const speak = async () => {
    if (audio) {
      togglePlayback();
    } else {
      isMutatingRef.current = true;
      const { data } = await mutate(textPart.text);
      setAudio(data);
      isMutatingRef.current = false;
    }
  };

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
      <IconButton
        label={
          isPlaying
            ? intl.formatMessage({ defaultMessage: "Pause" })
            : intl.formatMessage({ defaultMessage: "Play" })
        }
        variant="invisible"
        onPress={speak}
        className={cs.AssistantContentMessage.playPauseButton}
      >
        {isPending ? (
          <PiSpinnerGap />
        ) : isPlaying ? (
          <PiPauseFill />
        ) : (
          <PiSpeakerSimpleHighFill />
        )}
      </IconButton>
    </div>
  );
}
