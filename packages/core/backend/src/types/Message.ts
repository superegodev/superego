import type MessageRole from "../enums/MessageRole.js";
import type MessageContentPart from "./MessageContentPart.js";
import type NonEmptyArray from "./NonEmptyArray.js";
import type ToolCall from "./ToolCall.js";
import type ToolResult from "./ToolResult.js";

namespace Message {
  export interface Developer {
    role: MessageRole.Developer;
    content: [MessageContentPart.Text];
  }

  export interface UserContext {
    role: MessageRole.UserContext;
    content: NonEmptyArray<MessageContentPart.Text>;
  }

  export interface User {
    role: MessageRole.User;
    content: NonEmptyArray<MessageContentPart.Text>;
    createdAt: Date;
  }

  export interface Tool {
    role: MessageRole.Tool;
    toolResults: ToolResult[];
    createdAt: Date;
  }

  export interface ContentAssistant {
    role: MessageRole.Assistant;
    agent: string;
    content: NonEmptyArray<MessageContentPart.Text>;
    createdAt: Date;
  }
  export interface ToolCallAssistant {
    role: MessageRole.Assistant;
    agent: string;
    toolCalls: ToolCall[];
    createdAt: Date;
  }
  export type Assistant = ContentAssistant | ToolCallAssistant;
}

type Message =
  | Message.Developer
  | Message.UserContext
  | Message.User
  | Message.Tool
  | Message.Assistant;

export default Message;
