import * as v from "valibot";

enum MessageRole {
  Developer = "developer",
  UserContext = "user_context",
  User = "user",
  Assistant = "assistant",
  Tool = "tool",
}
export default MessageRole;

export const MessageRoleSchema = v.enum(MessageRole);
