import type { AudioContent, Conversation, Message } from "@superego/backend";
import Markdown from "markdown-to-jsx";
import { useEffect, useRef, useState } from "react";
import { Separator } from "react-aria-components";
import {
  PiPauseFill,
  PiSpeakerSimpleHighFill,
  PiSpinnerGap,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import useIsInferenceConfigured from "../../../business-logic/assistant/useIsInferenceConfigured.js";
import usePlayAudio from "../../../business-logic/audio/usePlayAudio.js";
import { useTts } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import IconLink from "../../design-system/IconLink/IconLink.js";
import * as cs from "./ConversationMessages.css.js";
import ThinkingTime from "./ThinkingTime.js";

interface Props {
  conversation: Conversation;
  message: Message.ContentAssistant;
}
export default function AssistantContentMessage({
  conversation,
  message,
}: Props) {
  const intl = useIntl();

  const isInferenceConfigured = useIsInferenceConfigured();

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
        className={cs.AssistantContentMessage.markdown}
        options={{
          overrides: {
            iframe: () => null,
            a: { props: { target: "_blank", rel: "noopener noreferrer" } },
            table: (props) => (
              <div className={cs.AssistantContentMessage.markdownTableScroller}>
                <table {...props} />
              </div>
            ),
          },
        }}
      >
        {textPart.text}
      </Markdown>
      <div className={cs.AssistantContentMessage.infoAndActions}>
        <ThinkingTime message={message} conversation={conversation} />
        <Separator
          orientation="vertical"
          className={cs.AssistantContentMessage.infoAndActionsSeparator}
        />
        {/* TODO: refactor into own SpeechButton component. */}
        {isInferenceConfigured.speech ? (
          <IconButton
            variant="invisible"
            label={
              isPending
                ? intl.formatMessage({
                    defaultMessage: "Synthesizing speech...",
                  })
                : isPlaying
                  ? intl.formatMessage({ defaultMessage: "Pause" })
                  : intl.formatMessage({ defaultMessage: "Play" })
            }
            onPress={speak}
            className={cs.AssistantContentMessage.infoAndActionsAction}
          >
            {isPending ? (
              <PiSpinnerGap />
            ) : isPlaying ? (
              <PiPauseFill />
            ) : (
              <PiSpeakerSimpleHighFill />
            )}
          </IconButton>
        ) : (
          <IconLink
            variant="invisible"
            label={intl.formatMessage({
              defaultMessage: "Configure speech to play assistant messages",
            })}
            to={{ name: RouteName.GlobalSettings }}
            className={cs.AssistantContentMessage.infoAndActionsAction}
            tooltipDelay={0}
          >
            <PiSpeakerSimpleHighFill />
          </IconLink>
        )}
      </div>
    </div>
  );
}
