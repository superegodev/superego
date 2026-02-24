import {
  type Conversation,
  ConversationStatus,
  type InferenceOptions,
  type InferenceProviderModelRef,
  type Message,
  MessageContentPartType,
} from "@superego/backend";
import { type RefObject, useMemo, useRef, useState } from "react";
import { DropZone, TextArea, TextField } from "react-aria-components";
import { useIntl } from "react-intl";
import useIsInferenceConfigured from "../../../business-logic/assistant/useIsInferenceConfigured.js";
import useRecordAudio from "../../../business-logic/audio/useRecordAudio.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import classnames from "../../../utils/classnames.js";
import {
  type Option,
  Select,
  SelectButton,
  SelectOptions,
} from "../../design-system/forms/forms.js";
import AddFilesButton from "./AddFilesButton.js";
import FilesTray from "./FilesTray.js";
import SendRecordButtons from "./SendRecordButtons.js";
import * as cs from "./UserMessageContentInput.css.js";
import useAutoResizeTextArea from "./useAutoResizeTextArea.js";
import useFiles from "./useFiles.js";

function serializeModelRef(ref: InferenceProviderModelRef): string {
  return `${ref.modelId}@${ref.providerName}`;
}

function deserializeModelRef(id: string): InferenceProviderModelRef {
  const atIndex = id.lastIndexOf("@");
  return {
    modelId: id.slice(0, atIndex),
    providerName: id.slice(atIndex + 1),
  };
}

// TODO_AI: review and refactor
interface Props {
  conversation: Conversation | null;
  onSend: (
    messageContent: Message.User["content"],
    inferenceOptions: InferenceOptions,
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
  textAreaRef,
  className,
}: Props) {
  const intl = useIntl();

  // We define an internal ref in case one is not provided from outside.
  const internalTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const actualTextAreaRef = textAreaRef ?? internalTextAreaRef;

  const { inference } = useGlobalData().globalSettings;

  const isInferenceConfigured = useIsInferenceConfigured();
  const isDisabled =
    (conversation !== null &&
      (conversation.hasOutdatedContext ||
        conversation?.status !== ConversationStatus.Idle)) ||
    isSending ||
    !isInferenceConfigured.chatCompletions;

  const modelOptions: Option[] = useMemo(() => {
    const options: Option[] = [];
    for (const provider of inference.providers) {
      for (const model of provider.models) {
        options.push({
          id: serializeModelRef({
            providerName: provider.name,
            modelId: model.id,
          }),
          label: `${model.name || model.id} (${provider.name})`,
        });
      }
    }
    return options;
  }, [inference.providers]);

  const [selectedModelRefKey, setSelectedModelRefKey] = useState<string | null>(
    inference.defaults.chat ? serializeModelRef(inference.defaults.chat) : null,
  );

  const getInferenceOptions = (): InferenceOptions => {
    const providerModelRef = selectedModelRefKey
      ? deserializeModelRef(selectedModelRefKey)
      : inference.defaults.chat!;
    return { providerModelRef };
  };

  const {
    files,
    onDrop,
    onPaste,
    onFilesAdded,
    onRemoveFile,
    removeAllFiles,
    getContentParts,
  } = useFiles(allowFileParts && isInferenceConfigured.chatCompletions);

  const [text, setText] = useState(initialMessage ?? "");
  const sendText = async () => {
    onSend(
      [
        { type: MessageContentPartType.Text, text: text },
        ...(await getContentParts()),
      ],
      getInferenceOptions(),
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
        getInferenceOptions(),
      );
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
        <div className={cs.UserMessageContentInput.actionsToolbarLeft}>
          {allowFileParts ? (
            <AddFilesButton
              onFilesAdded={onFilesAdded}
              isDisabled={isDisabled || isRecording}
              isChatCompletionsConfigured={
                isInferenceConfigured.chatCompletions
              }
            />
          ) : null}
          {modelOptions.length > 0 ? (
            <Select
              aria-label={intl.formatMessage({ defaultMessage: "Model" })}
              value={selectedModelRefKey}
              onChange={(key) => setSelectedModelRefKey(key as string | null)}
              isDisabled={isDisabled || isRecording}
              className={cs.UserMessageContentInput.modelSelect}
            >
              <SelectButton />
              <SelectOptions options={modelOptions} />
            </Select>
          ) : null}
        </div>
        <SendRecordButtons
          areChatCompletionsConfigured={isInferenceConfigured.chatCompletions}
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
