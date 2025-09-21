import type { AudioContent, Message } from "@superego/backend";
import { useEffect, useRef, useState } from "react";
import {
  PiPauseFill,
  PiSpeakerSimpleHighFill,
  PiSpinnerGap,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import useIsInferenceConfigured from "../../../../business-logic/assistant/useIsInferenceConfigured.js";
import usePlayAudio from "../../../../business-logic/audio/usePlayAudio.js";
import { useTts } from "../../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import IconButton from "../../../design-system/IconButton/IconButton.jsx";
import IconLink from "../../../design-system/IconLink/IconLink.jsx";

interface Props {
  message: Message.ContentAssistant;
  className: string;
}
export default function SpeakButton({ message, className }: Props) {
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

  return isInferenceConfigured.speech ? (
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
      className={className}
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
      className={className}
      tooltipDelay={0}
    >
      <PiSpeakerSimpleHighFill />
    </IconLink>
  );
}
