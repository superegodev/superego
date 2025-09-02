import type { Message } from "@superego/backend";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  message: Message.User;
}
export default function UserMessage({ message }: Props) {
  return <div className={cs.UserMessage.root}>{message.content[0].text}</div>;
}
