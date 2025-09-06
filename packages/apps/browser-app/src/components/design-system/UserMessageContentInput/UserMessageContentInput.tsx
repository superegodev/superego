import { type Message, MessageContentPartType } from "@superego/backend";
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { TextArea, TextField } from "react-aria-components";
import {
  PiMicrophoneFill,
  PiPaperPlaneRightFill,
  PiStopFill,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import classnames from "../../../utils/classnames.js";
import IconButton from "../IconButton/IconButton.js";
import ThreeDotSpinner from "../ThreeDotSpinner/ThreeDotSpinner.js";
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

  const [isRecording, setIsRecording] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      try {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = null;
          mediaRecorderRef.current.stop();
        }
      } catch {}
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream, {
      audioBitsPerSecond: 16000,
    });
    mediaRecorderRef.current = mediaRecorder;
    const recordedChunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (evt) => {
      if (evt.data && evt.data.size > 0) {
        recordedChunks.push(evt.data);
      }
    };

    mediaRecorder.onstop = async () => {
      try {
        const chunksBlob = new Blob(recordedChunks, {
          type: mediaRecorder.mimeType,
        });
        const audioContent = new Uint8Array(await chunksBlob.arrayBuffer());
        onSend([
          {
            type: MessageContentPartType.Audio,
            audio: {
              content: audioContent,
              contentType: mediaRecorder.mimeType,
            },
          },
        ]);
      } finally {
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
  }, [onSend]);

  const stopRecordingAndSend = useCallback(() => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {}
    setIsRecording(false);
  }, []);

  const handleButtonPress = () => {
    if (text !== "") {
      onSend([{ type: MessageContentPartType.Text, text: text }]);
      setText("");
    } else if (isRecording) {
      stopRecordingAndSend();
    } else {
      startRecording();
    }
  };

  return (
    <div className={classnames(cs.UserMessageContentInput.root, className)}>
      <TextField
        className={cs.UserMessageContentInput.textField}
        onChange={setText}
        value={text}
        aria-label={intl.formatMessage({
          defaultMessage: "Message to assistant",
        })}
        autoFocus={autoFocus}
        isDisabled={isProcessingMessage}
        onKeyDown={(evt) => {
          if (evt.key === "Enter" && !evt.shiftKey) {
            evt.preventDefault();
            handleButtonPress();
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
      <IconButton
        variant="invisible"
        label={
          text !== ""
            ? intl.formatMessage({ defaultMessage: "Send" })
            : isRecording
              ? intl.formatMessage({ defaultMessage: "Stop recording" })
              : intl.formatMessage({ defaultMessage: "Start recording" })
        }
        className={cs.UserMessageContentInput.sendOrMicButton}
        isDisabled={isProcessingMessage}
        onPress={handleButtonPress}
      >
        {isProcessingMessage ? (
          <ThreeDotSpinner className={cs.UserMessageContentInput.spinner} />
        ) : text !== "" ? (
          <PiPaperPlaneRightFill />
        ) : isRecording ? (
          <PiStopFill />
        ) : (
          <PiMicrophoneFill />
        )}
      </IconButton>
    </div>
  );
}
