import type { Conversation } from "@superego/backend";
import { useCallback, useEffect, useState } from "react";
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

  const [showSpinner, setShowSpinner] = useState(!reasoningTrace);
  useEffect(() => {
    setShowSpinner(!reasoningTrace);
  }, [reasoningTrace]);
  const onEffectFinished = useCallback(() => setShowSpinner(true), []);

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
