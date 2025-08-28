import { type Message, MessageContentPartType } from "@superego/backend";
import { useState } from "react";
import { TextArea, TextField } from "react-aria-components";
import { PiPaperPlaneRightFill } from "react-icons/pi";
import { useIntl } from "react-intl";
import IconButton from "../IconButton/IconButton.jsx";
import * as cs from "./UserMessageContentInput.css.js";

interface Props {
  onSend: (messageContent: Message.User["content"]) => void;
  placeholder: string;
  autoFocus: boolean;
  isDisabled: boolean;
}
export default function UserMessageContentInput({
  onSend,
  placeholder,
  autoFocus,
  isDisabled,
}: Props) {
  const intl = useIntl();
  const [text, setText] = useState("");
  const send = () => {
    onSend([{ type: MessageContentPartType.Text, text: text }]);
    setText("");
  };
  return (
    <div className={cs.UserMessageContentInput.root}>
      <TextField
        className={cs.UserMessageContentInput.textField}
        onChange={setText}
        value={text}
        aria-label={intl.formatMessage({
          defaultMessage: "Message to assistant",
        })}
        autoFocus={autoFocus}
        isDisabled={isDisabled}
        onKeyDown={(evt) => {
          if (evt.key === "Enter" && !evt.shiftKey) {
            evt.preventDefault();
            evt.stopPropagation();
            send();
          }
        }}
      >
        <TextArea
          placeholder={placeholder}
          className={cs.UserMessageContentInput.textArea}
        />
      </TextField>
      <IconButton
        variant="invisible"
        label={intl.formatMessage({ defaultMessage: "Send" })}
        className={cs.UserMessageContentInput.sendButton}
        isDisabled={isDisabled || text === ""}
        onPress={send}
      >
        <PiPaperPlaneRightFill />
      </IconButton>
    </div>
  );
}
