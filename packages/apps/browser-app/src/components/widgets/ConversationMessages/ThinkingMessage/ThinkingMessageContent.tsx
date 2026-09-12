import type { Conversation } from "@superego/backend";
import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import MatrixSpinner from "../../../design-system/MatrixSpinner/MatrixSpinner.js";
import TypingText from "../../../design-system/TypingText/TypingText.js";
import getReasoningTrace from "./getReasoningTrace.js";
import getStatusText from "./getStatusText.js";
import * as cs from "./ThinkingMessage.css.js";

interface Props {
  conversation: Conversation;
}
export default function ThinkingMessageContent({ conversation }: Props) {
  const intl = useIntl();

  const statusText = getStatusText(intl, conversation);
  const reasoningTrace = getReasoningTrace(conversation);

  const [animation, setAnimation] = useState({
    reasoningTrace,
    revision: 0,
    finished: false,
  });
  if (animation.reasoningTrace !== reasoningTrace) {
    setAnimation({
      reasoningTrace,
      revision: animation.revision + 1,
      finished: false,
    });
  }
  const { revision } = animation;
  const onEffectFinished = useCallback(() => {
    // Completion belongs to this animation, even if the same text appears again.
    setAnimation((current) =>
      current.revision === revision && !current.finished
        ? { ...current, finished: true }
        : current,
    );
  }, [revision]);
  const showSpinner = !reasoningTrace || animation.finished;

  return (
    <div className={cs.ThinkingMessageContent.root}>
      {reasoningTrace ? (
        <div className={cs.ThinkingMessageContent.reasoningTrace}>
          <TypingText
            text={reasoningTrace}
            onEffectFinished={onEffectFinished}
          />
        </div>
      ) : null}
      {showSpinner ? (
        <div className={cs.ThinkingMessageContent.header}>
          <MatrixSpinner />
          <span className={cs.ThinkingMessageContent.summary}>
            {statusText}
          </span>
        </div>
      ) : null}
    </div>
  );
}
