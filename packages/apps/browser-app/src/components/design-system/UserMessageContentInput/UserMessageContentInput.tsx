import { type Message, MessageContentPartType } from "@superego/backend";
import { type RefObject, useState } from "react";
import { TextArea, TextField } from "react-aria-components";
import { useIntl } from "react-intl";
import useRecordAudio from "../../../business-logic/audio/useRecordAudio.js";
import classnames from "../../../utils/classnames.js";
import ThreeDotSpinner from "../ThreeDotSpinner/ThreeDotSpinner.js";
import SendRecordToolbar from "./SendRecordToolbar.jsx";
import * as cs from "./UserMessageContentInput.css.js";

interface Props {
  onSend: (messageContent: Message.User["content"]) => void;
  autoFocus: boolean;
  isProcessingMessage: boolean;
  textAreaRef?: RefObject<HTMLTextAreaElement | null> | undefined;
  className?: string | undefined;
}
export default function UserMessageContentInput({
  onSend,
  autoFocus,
  isProcessingMessage,
  textAreaRef,
  className,
}: Props) {
  const intl = useIntl();

  const [text, setText] = useState("");
  const sendText = () => {
    onSend([{ type: MessageContentPartType.Text, text: text }]);
    setText("");
  };

  const { isRecording, startRecording, finishRecording, cancelRecording } =
    useRecordAudio((audio) => {
      onSend([{ type: MessageContentPartType.Audio, audio: audio }]);
    });

  return (
    <div className={classnames(cs.UserMessageContentInput.root, className)}>
      <TextField
        className={cs.UserMessageContentInput.textField}
        onChange={setText}
        value={text}
        aria-label={intl.formatMessage({ defaultMessage: "Message assistant" })}
        autoFocus={autoFocus}
        isDisabled={isProcessingMessage || isRecording}
        onKeyDown={(evt) => {
          if (evt.key === "Enter" && !evt.shiftKey) {
            evt.preventDefault();
            sendText();
          }
        }}
      >
        <TextArea
          placeholder={intl.formatMessage({
            defaultMessage: "How can I help you?",
          })}
          className={cs.UserMessageContentInput.textArea}
          ref={textAreaRef}
        />
      </TextField>
      {isProcessingMessage ? (
        <ThreeDotSpinner className={cs.UserMessageContentInput.spinner} />
      ) : (
        <SendRecordToolbar
          isWriting={text !== ""}
          isRecording={isRecording}
          onSend={sendText}
          onStartRecording={startRecording}
          onCancelRecording={cancelRecording}
          onStopRecordingAndSend={finishRecording}
        />
      )}
    </div>
  );
}
