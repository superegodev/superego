import type { ResultError } from "@superego/global-types";
import type AssistantName from "../enums/AssistantName.js";
import type ConversationStatus from "../enums/ConversationStatus.js";
import type ConversationId from "../ids/ConversationId.js";
import type ConversationNodeId from "../ids/ConversationNodeId.js";
import type Message from "./Message.js";

export namespace ConversationNode {
  export interface MessageNode {
    type: "Message";
    id: ConversationNodeId;
    previousNodeId: ConversationNodeId | null;
    message: Message;
    createdAt: Date;
  }

  export interface ErrorNode {
    type: "Error";
    id: ConversationNodeId;
    previousNodeId: ConversationNodeId | null;
    error: ResultError<any, any>;
    createdAt: Date;
  }
}
export type ConversationNode =
  | ConversationNode.MessageNode
  | ConversationNode.ErrorNode;

type Conversation = {
  id: ConversationId;
  assistant: AssistantName;
  title: string | null;
  hasOutdatedContext: boolean;
  canRetryLastResponse: boolean;
  nodes: ConversationNode[];
  activeNodeId: ConversationNodeId | null;
  status: ConversationStatus;
  processingStartedAt: Date | null;
  error: { name: string; details: any } | null;
  createdAt: Date;
} & (
  | {
      status: ConversationStatus.Idle;
      processingStartedAt: null;
      error: null;
    }
  | {
      status: ConversationStatus.Processing;
      processingStartedAt: Date;
      error: null;
    }
  | {
      status: ConversationStatus.Error;
      processingStartedAt: null;
      error: { name: string; details: any };
    }
);
export default Conversation;
