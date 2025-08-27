import { type Message, MessageContentPartType } from "@superego/backend";
import { useState } from "react";
import { TextArea, TextField } from "react-aria-components";
import { PiPaperPlaneRightFill } from "react-icons/pi";
import { useIntl } from "react-intl";
import IconButton from "../IconButton/IconButton.jsx";
import * as cs from "./AssistantMessageInput.css.js";

interface Props {
  onSend: (messageContent: Message.User["content"]) => void;
}
export default function AssistantMessageInput({ onSend }: Props) {
  const intl = useIntl();
  const [text, setText] = useState("");
  return (
    <div className={cs.AssistantMessageInput.root}>
      <TextField
        className={cs.AssistantMessageInput.textField}
        onChange={setText}
        value={text}
        aria-label={intl.formatMessage({
          defaultMessage: "Assistant text input",
        })}
        autoFocus={true}
      >
        <TextArea
          placeholder={intl.formatMessage({
            defaultMessage: "How can I help you?",
          })}
          className={cs.AssistantMessageInput.textArea}
        />
      </TextField>
      <IconButton
        variant="invisible"
        label={intl.formatMessage({
          defaultMessage: "Send",
        })}
        className={cs.AssistantMessageInput.sendButton}
        isDisabled={text === ""}
        onPress={() =>
          onSend([{ type: MessageContentPartType.Text, text: text }])
        }
      >
        <PiPaperPlaneRightFill />
      </IconButton>
    </div>
  );
}
