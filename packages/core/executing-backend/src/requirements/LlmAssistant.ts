import {
  type CollectionId,
  type ConversationType,
  type Message,
  MessagePartType,
  type MessageRole,
} from "@superego/backend";
import type CollectionEntity from "../entities/CollectionEntity.js";

interface LlmAssistant {
  generateNextMessage(
    conversationType: ConversationType,
    previousMessages: LlmAssistant.Message[],
    collections: CollectionEntity[],
  ): Promise<LlmAssistant.GetNextMessageResult>;
}
namespace LlmAssistant {
  export enum MessagePartType {
    Text = "Text",
    CreateDocument = "CreateDocument",
  }

  export interface Text {
    type: MessagePartType.Text;
    content: string;
    contentType: "text/plain" | "text/markdown";
  }
  export interface CreateDocument {
    type: MessagePartType.CreateDocument;
    collectionId: CollectionId;
    documentContent: any;
  }
  export type MessagePart = Text | CreateDocument;

  export interface Message {
    role: MessageRole;
    parts: MessagePart[];
  }

  export type GetNextMessageResult =
    | { success: true; message: Message }
    | { success: false; error: string };
}
export default LlmAssistant;

export function toLlmAssistantMessage(message: Message): LlmAssistant.Message {
  return {
    role: message.role,
    parts: message.parts.map((part) =>
      part.type === MessagePartType.Audio
        ? {
            type: LlmAssistant.MessagePartType.Text,
            content: part.transcription,
            contentType: "text/plain",
          }
        : part.type === MessagePartType.Text
          ? {
              type: LlmAssistant.MessagePartType.Text,
              content: part.content,
              contentType: part.contentType,
            }
          : {
              type: LlmAssistant.MessagePartType.CreateDocument,
              collectionId: "" as any, // TODO
              documentContent: {},
            },
    ),
  };
}
