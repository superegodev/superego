import {
  type CollectionId,
  type ConversationType,
  type Message,
  MessagePartType,
  type MessageRole,
} from "@superego/backend";
import type CollectionEntity from "../entities/CollectionEntity.js";

interface Assistant {
  generateNextMessage(
    conversationType: ConversationType,
    previousMessages: Assistant.Message[],
    collections: CollectionEntity[],
  ): Promise<Assistant.GetNextMessageResult>;
}
namespace Assistant {
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
export default Assistant;

export function toAssistantMessage(message: Message): Assistant.Message {
  return {
    role: message.role,
    parts: message.parts.map((part) =>
      part.type === MessagePartType.Text
        ? {
            type: Assistant.MessagePartType.Text,
            content: part.content,
            contentType: part.contentType,
          }
        : {
            type: Assistant.MessagePartType.CreateDocument,
            collectionId: part.collectionId,
            documentContent: part.documentContent,
          },
    ),
  };
}
