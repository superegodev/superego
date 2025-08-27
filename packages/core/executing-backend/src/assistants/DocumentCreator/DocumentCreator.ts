import {
  type Collection,
  type ConversationFormat,
  type Message,
  MessageContentPartType,
  MessageRole,
  type ToolCall,
  type ToolResult,
} from "@superego/backend";
import type InferenceService from "../../requirements/InferenceService.js";
import type DocumentsCreate from "../../usecases/documents/Create.js";
import type Assistant from "../Assistant.js";
import developer from "./prompts/developer.js";
import userContext from "./prompts/userContext.js";
import CompleteConversation from "./tools/CompleteConversation.js";
import CreateDocumentForCollection from "./tools/CreateDocumentForCollection.js";
import GetCollectionTypescriptSchema from "./tools/GetCollectionTypescriptSchema.js";
import Unknown from "./tools/Unknown.js";

export default class DocumentCreator implements Assistant {
  constructor(
    private inferenceService: InferenceService,
    private collections: Collection[],
    private usecases: {
      documentsCreate: DocumentsCreate;
    },
  ) {}

  async generateAndProcessNextMessages(
    conversationFormat: ConversationFormat,
    messages: Message[],
  ): Promise<{
    hasCompletedConversation: boolean;
    messages: Message[];
  }> {
    const assistantMessage = await this.inferenceService.generateNextMessage(
      [
        {
          role: MessageRole.Developer,
          content: [
            {
              type: MessageContentPartType.Text,
              text: developer(conversationFormat),
            },
          ],
        },
        {
          role: MessageRole.UserContext,
          content: [
            {
              type: MessageContentPartType.Text,
              text: userContext(this.collections),
            },
          ],
        },
        ...messages,
      ],
      this.getTools(messages),
    );

    // Case: assistantMessage is Message.ContentAssistant
    if ("content" in assistantMessage) {
      return {
        hasCompletedConversation: false,
        messages: [...messages, assistantMessage],
      };
    }

    // Case: assistantMessage is Message.ToolCallAssistant with a single
    // ToolCall.CompleteConversation.
    if (
      assistantMessage.toolCalls.length === 1 &&
      CompleteConversation.is(assistantMessage.toolCalls[0]!)
    ) {
      return {
        hasCompletedConversation: true,
        messages: [...messages, assistantMessage],
      };
    }

    // Case: assistantMessage is Message.ToolCallAssistant.
    const toolResults: ToolResult[] = await Promise.all(
      assistantMessage.toolCalls.map((toolCall) =>
        this.processToolCall(toolCall),
      ),
    );
    const toolMessage: Message.Tool = {
      role: MessageRole.Tool,
      toolResults: toolResults,
      createdAt: new Date(),
    };
    return this.generateAndProcessNextMessages(conversationFormat, [
      ...messages,
      assistantMessage,
      toolMessage,
    ]);
  }

  private getTools(messages: Message[]): InferenceService.Tool[] {
    return [
      GetCollectionTypescriptSchema.get(),
      ...messages
        .filter((message) => "toolCalls" in message)
        .flatMap((message) => message.toolCalls)
        .filter((toolCall) => GetCollectionTypescriptSchema.is(toolCall))
        .map((toolCall) =>
          this.collections.find(
            (collection) => collection.id === toolCall.input.collectionId,
          ),
        )
        .filter((collection) => collection !== undefined)
        .map((collection) => CreateDocumentForCollection.get(collection)),
      CompleteConversation.get(),
    ];
  }

  private async processToolCall(toolCall: ToolCall): Promise<ToolResult> {
    if (GetCollectionTypescriptSchema.is(toolCall)) {
      return GetCollectionTypescriptSchema.exec(toolCall, this.collections);
    }
    if (CreateDocumentForCollection.is(toolCall)) {
      return CreateDocumentForCollection.exec(
        toolCall,
        this.usecases.documentsCreate,
      );
    }
    if (CompleteConversation.is(toolCall)) {
      return CompleteConversation.exec(toolCall);
    }
    return Unknown.exec(toolCall);
  }
}
