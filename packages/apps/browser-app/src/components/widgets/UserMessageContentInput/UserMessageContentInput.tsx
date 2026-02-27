import {
  type Conversation,
  ConversationStatus,
  type InferenceOptions,
  type Message,
  MessageContentPartType,
} from "@superego/backend";
import { type RefObject, useRef, useState } from "react";
import { DropZone, TextArea, TextField } from "react-aria-components";
import { useIntl } from "react-intl";
import useRecordAudio from "../../../business-logic/audio/useRecordAudio.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import getIsInferenceConfigured from "../../../business-logic/inference/getIsInferenceConfigured.js";
import mergeInferenceOptions from "../../../business-logic/inference/mergeInferenceOptions.js";
import useDefaultInferenceOptions from "../../../business-logic/inference/useDefaultInferenceOptions.js";
import classnames from "../../../utils/classnames.js";
import AddFilesButton from "./AddFilesButton.js";
import FilesTray from "./FilesTray.js";
import InferenceOptionsInput from "./InferenceOptionsInput.js";
import SendRecordButtons from "./SendRecordButtons.js";
import * as cs from "./UserMessageContentInput.css.js";
import useAutoResizeTextArea from "./useAutoResizeTextArea.js";
import useFiles from "./useFiles.js";

interface Props {
  conversation: Conversation | null;
  onSend: (
    messageContent: Message.User["content"],
    inferenceOptions: InferenceOptions<"completion">,
  ) => void;
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
  textAreaRef: externalTextAreaRef,
  className,
}: Props) {
  const intl = useIntl();

  // We define an internal ref in case one is not provided from outside.
  const internalTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const textAreaRef = externalTextAreaRef ?? internalTextAreaRef;

  const { globalSettings } = useGlobalData();
  const defaultInferenceOptions = useDefaultInferenceOptions();
  const [customInferenceOptions, setCustomInferenceOptions] =
    useState<InferenceOptions<"completion"> | null>(null);
  const inferenceOptions = mergeInferenceOptions(
    defaultInferenceOptions,
    customInferenceOptions,
  );

  const isInferenceConfigured = getIsInferenceConfigured(
    defaultInferenceOptions,
  );
  const globalIsDisabled =
    (conversation !== null &&
      (conversation.hasOutdatedContext ||
        conversation?.status !== ConversationStatus.Idle)) ||
    isSending ||
    !isInferenceConfigured.completion;

  const {
    files,
    onDrop,
    onPaste,
    onFilesAdded,
    onRemoveFile,
    removeAllFiles,
    getContentParts,
  } = useFiles(allowFileParts && !globalIsDisabled);

  const [text, setText] = useState(initialMessage ?? "");
  const sendText = async () => {
    onSend(
      [
        { type: MessageContentPartType.Text, text: text },
        ...(await getContentParts()),
      ],
      // sendText can be invoked only when inferenceOptions.completion is not
      // null.
      inferenceOptions as InferenceOptions<"completion">,
    );
    setText("");
    removeAllFiles();
  };

  const { isRecording, startRecording, finishRecording, cancelRecording } =
    useRecordAudio(async (audio) => {
      onSend(
        [
          { type: MessageContentPartType.Audio, audio: audio },
          ...(await getContentParts()),
        ],
        // This callback can be invoked only when inferenceOptions.completion
        // and inferenceOptions.transcription are not null.
        inferenceOptions as InferenceOptions<"completion" | "transcription">,
      );
      removeAllFiles();
    });

  // Auto-resize textarea.
  useAutoResizeTextArea(textAreaRef, text);

  return (
    <DropZone
      ref={ref}
      onDrop={onDrop}
      isDisabled={globalIsDisabled || isRecording}
      className={classnames(cs.UserMessageContentInput.root, className)}
    >
      <FilesTray
        files={files}
        onRemoveFile={onRemoveFile}
        isRemoveDisabled={globalIsDisabled || isRecording}
      />
      <TextField
        className={cs.UserMessageContentInput.textField}
        onChange={setText}
        value={text}
        aria-label={intl.formatMessage({ defaultMessage: "Message assistant" })}
        autoFocus={autoFocus}
        isDisabled={globalIsDisabled || isRecording}
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
          ref={textAreaRef}
          rows={1}
          placeholder={
            conversation?.hasOutdatedContext
              ? intl.formatMessage({
                  defaultMessage:
                    "Your collections changed since having this conversation. It cannot be continued.",
                })
              : isInferenceConfigured.completion
                ? placeholder
                : intl.formatMessage({
                    defaultMessage: "Configure assistant to start chatting",
                  })
          }
          className={cs.UserMessageContentInput.textArea}
        />
      </TextField>
      <div className={cs.UserMessageContentInput.actionsToolbar}>
        <div className={cs.UserMessageContentInput.actionsToolbarLeft}>
          {allowFileParts ? (
            <AddFilesButton
              onFilesAdded={onFilesAdded}
              isDisabled={globalIsDisabled || isRecording}
            />
          ) : null}
          <InferenceOptionsInput
            inferenceSettings={globalSettings.inference}
            defaultInferenceOptions={defaultInferenceOptions}
            value={customInferenceOptions}
            onChange={setCustomInferenceOptions}
            isDisabled={globalIsDisabled || isRecording}
          />
        </div>
        <SendRecordButtons
          isCompletionConfigured={isInferenceConfigured.completion}
          isWriting={text.trim() !== ""}
          isRecording={isRecording}
          isDisabled={globalIsDisabled}
          onSend={sendText}
          onStartRecording={startRecording}
          onCancelRecording={cancelRecording}
          onFinishRecording={finishRecording}
        />
      </div>
    </DropZone>
  );
}
