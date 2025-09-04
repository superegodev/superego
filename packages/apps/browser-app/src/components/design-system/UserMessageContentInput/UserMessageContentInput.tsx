import { type Message, MessageContentPartType } from "@superego/backend";
import { type RefObject, useState } from "react";
import { TextArea, TextField } from "react-aria-components";
import { PiPaperPlaneRightFill } from "react-icons/pi";
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
  const send = () => {
    onSend([{ type: MessageContentPartType.Text, text: text }]);
    setText("");
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
            send();
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
        label={intl.formatMessage({ defaultMessage: "Send" })}
        className={cs.UserMessageContentInput.sendButton}
        isDisabled={isProcessingMessage || text === ""}
        onPress={send}
      >
        {isProcessingMessage ? (
          <ThreeDotSpinner className={cs.UserMessageContentInput.spinner} />
        ) : (
          <PiPaperPlaneRightFill />
        )}
      </IconButton>
    </div>
  );
}
