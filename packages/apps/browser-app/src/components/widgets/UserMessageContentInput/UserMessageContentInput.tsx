import {
  type Conversation,
  ConversationStatus,
  type Message,
  MessageContentPartType,
} from "@superego/backend";
import { type RefObject, useRef, useState } from "react";
import { TextArea, TextField } from "react-aria-components";
import { useIntl } from "react-intl";
import useIsInferenceConfigured from "../../../business-logic/assistant/useIsInferenceConfigured.js";
import useRecordAudio from "../../../business-logic/audio/useRecordAudio.js";
import classnames from "../../../utils/classnames.js";
import ThreeDotSpinner from "../../design-system/ThreeDotSpinner/ThreeDotSpinner.js";
import SendRecordToolbar from "./SendRecordToolbar.js";
import * as cs from "./UserMessageContentInput.css.js";
import useAutoResizeTextArea from "./useAutoResizeTextArea.js";

interface Props {
  conversation: Conversation | null;
  onSend: (messageContent: Message.User["content"]) => void;
  isSending: boolean;
  initialMessage?: string | undefined;
  placeholder: string;
  autoFocus: boolean;
  textAreaRef?: RefObject<HTMLTextAreaElement | null> | undefined;
  className?: string | undefined;
}
export default function UserMessageContentInput({
  conversation,
  onSend,
  isSending,
  initialMessage,
  placeholder,
  autoFocus,
  textAreaRef,
  className,
}: Props) {
  const intl = useIntl();

  // We define an internal ref in case one is not provided from outside.
  const internalTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const actualTextAreaRef = textAreaRef ?? internalTextAreaRef;

  const isInferenceConfigured = useIsInferenceConfigured();

  const [text, setText] = useState(initialMessage ?? "");
  const sendText = () => {
    onSend([{ type: MessageContentPartType.Text, text: text }]);
    setText("");
  };

  const { isRecording, startRecording, finishRecording, cancelRecording } =
    useRecordAudio((audio) => {
      onSend([{ type: MessageContentPartType.Audio, audio: audio }]);
    });

  // Auto-resize textarea.
  useAutoResizeTextArea(actualTextAreaRef, text);

  return (
    <div className={classnames(cs.UserMessageContentInput.root, className)}>
      <TextField
        className={cs.UserMessageContentInput.textField}
        onChange={setText}
        value={text}
        aria-label={intl.formatMessage({ defaultMessage: "Message assistant" })}
        autoFocus={autoFocus}
        isDisabled={
          (conversation !== null &&
            (conversation.hasOutdatedContext ||
              conversation?.status !== ConversationStatus.Idle)) ||
          isSending ||
          isRecording ||
          !isInferenceConfigured.chatCompletions
        }
        onKeyDown={(evt) => {
          if (evt.key === "Enter" && !evt.shiftKey) {
            evt.preventDefault();
            if (text.trim() !== "") {
              sendText();
            }
          }
        }}
      >
        <TextArea
          rows={1}
          placeholder={
            conversation?.hasOutdatedContext
              ? intl.formatMessage({
                  defaultMessage:
                    "Your collections changed since having this conversation. It cannot be continued.",
                })
              : isInferenceConfigured.chatCompletions
                ? placeholder
                : intl.formatMessage({
                    defaultMessage: "Configure assistant to start chatting",
                  })
          }
          className={cs.UserMessageContentInput.textArea}
          ref={actualTextAreaRef}
        />
      </TextField>
      {isSending || conversation?.status === ConversationStatus.Processing ? (
        <ThreeDotSpinner className={cs.UserMessageContentInput.spinner} />
      ) : (
        <SendRecordToolbar
          areChatCompletionsConfigured={isInferenceConfigured.chatCompletions}
          areTranscriptionsConfigured={isInferenceConfigured.transcriptions}
          isWriting={text.trim() !== ""}
          isRecording={isRecording}
          isDisabled={
            (conversation !== null &&
              (conversation.hasOutdatedContext ||
                conversation?.status !== ConversationStatus.Idle)) ||
            isSending
          }
          onSend={sendText}
          onStartRecording={startRecording}
          onCancelRecording={cancelRecording}
          onFinishRecording={finishRecording}
        />
      )}
    </div>
  );
}
