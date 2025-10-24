import type MessageSender from "./MessageSender.js";
import type MessageType from "./MessageType.js";

export default function isMessageWith(
  message: unknown,
  sender: MessageSender,
  type: MessageType,
): boolean {
  return (
    message !== null &&
    typeof message === "object" &&
    "sender" in message &&
    message.sender === sender &&
    "type" in message &&
    message.type === type
  );
}
