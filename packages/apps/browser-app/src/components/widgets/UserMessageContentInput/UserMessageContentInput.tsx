import {
  type Conversation,
  ConversationStatus,
  type Message,
  MessageContentPartType,
} from "@superego/backend";
import { type RefObject, useRef, useState } from "react";
import { DropZone, TextArea, TextField } from "react-aria-components";
import { useIntl } from "react-intl";
import useIsInferenceConfigured from "../../../business-logic/assistant/useIsInferenceConfigured.js";
import useRecordAudio from "../../../business-logic/audio/useRecordAudio.js";
import classnames from "../../../utils/classnames.js";
import AddFilesButton from "./AddFilesButton.js";
import FilesTray from "./FilesTray.js";
import SendRecordButtons from "./SendRecordButtons.js";
import * as cs from "./UserMessageContentInput.css.js";
import useAutoResizeTextArea from "./useAutoResizeTextArea.js";
import useFiles from "./useFiles.js";

interface Props {
  conversation: Conversation | null;
  onSend: (messageContent: Message.User["content"]) => void;
  isSending: boolean;
  initialMessage?: string | undefined;
  placeholder: string;
  autoFocus: boolean;
  allowFileParts?: boolean;
  ref?: RefObject<HTMLDivElement | null> | undefined;
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
  allowFileParts = true,
  ref,
  textAreaRef,
  className,
}: Props) {
  const intl = useIntl();

  // We define an internal ref in case one is not provided from outside.
  const internalTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const actualTextAreaRef = textAreaRef ?? internalTextAreaRef;

  const isInferenceConfigured = useIsInferenceConfigured();
  const isDisabled =
    (conversation !== null &&
      (conversation.hasOutdatedContext ||
        conversation?.status !== ConversationStatus.Idle)) ||
    isSending ||
    !isInferenceConfigured.chatCompletions;

  const {
    files,
    onDrop,
    onPaste,
    onFilesAdded,
    onRemoveFile,
    removeAllFiles,
    getContentParts,
  } = useFiles(allowFileParts && isInferenceConfigured.fileInspection);

  const [text, setText] = useState(initialMessage ?? "");
  const sendText = async () => {
    onSend([
      { type: MessageContentPartType.Text, text: text },
      ...(await getContentParts()),
    ]);
    setText("");
    removeAllFiles();
  };

  const { isRecording, startRecording, finishRecording, cancelRecording } =
    useRecordAudio(async (audio) => {
      onSend([
        { type: MessageContentPartType.Audio, audio: audio },
        ...(await getContentParts()),
      ]);
      removeAllFiles();
    });

  // Auto-resize textarea.
  useAutoResizeTextArea(actualTextAreaRef, text);

  return (
    <DropZone
      ref={ref}
      onDrop={onDrop}
      isDisabled={isDisabled || isRecording}
      className={classnames(cs.UserMessageContentInput.root, className)}
    >
      <FilesTray
        files={files}
        onRemoveFile={onRemoveFile}
        isRemoveDisabled={isDisabled || isRecording}
      />
      <TextField
        className={cs.UserMessageContentInput.textField}
        onChange={setText}
        value={text}
        aria-label={intl.formatMessage({ defaultMessage: "Message assistant" })}
        autoFocus={autoFocus}
        isDisabled={isDisabled || isRecording}
        onPaste={onPaste}
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
      <div className={cs.UserMessageContentInput.actionsToolbar}>
        <div>
          {allowFileParts ? (
            <AddFilesButton
              onFilesAdded={onFilesAdded}
              isDisabled={isDisabled || isRecording}
              isFileInspectionConfigured={isInferenceConfigured.fileInspection}
            />
          ) : null}
        </div>
        <SendRecordButtons
          areChatCompletionsConfigured={isInferenceConfigured.chatCompletions}
          areTranscriptionsConfigured={isInferenceConfigured.transcriptions}
          isWriting={text.trim() !== ""}
          isRecording={isRecording}
          isDisabled={isDisabled}
          onSend={sendText}
          onStartRecording={startRecording}
          onCancelRecording={cancelRecording}
          onFinishRecording={finishRecording}
        />
      </div>
    </DropZone>
  );
}
