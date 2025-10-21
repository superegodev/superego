import type MessageType from "./MessageType.js";

export default function isMessageWithType(
  message: unknown,
  type: MessageType,
): boolean {
  return (
    message !== null &&
    typeof message === "object" &&
    "type" in message &&
    message.type === type
  );
}
