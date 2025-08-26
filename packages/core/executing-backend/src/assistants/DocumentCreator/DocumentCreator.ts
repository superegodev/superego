import {
  type Assistant,
  type Collection,
  type ConversationFormat,
  ConversationStatus,
  type Message,
  MessageContentPartType,
  MessageRole,
  type ToolCall,
  type ToolResult,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import type DataRepositories from "../../requirements/DataRepositories.js";
import type DocumentsCreate from "../../usecases/documents/Create.js";
import developer from "./prompts/developer.js";
import userContext from "./prompts/userContext.js";
import CompleteConversation from "./tools/CompleteConversation.js";
import CreateDocumentForCollection from "./tools/CreateDocumentForCollection.js";
import GetCollectionTypescriptSchema from "./tools/GetCollectionTypescriptSchema.js";
import Unknown from "./tools/Unknown.js";
import getContextFingerprint from "./utils/getContextFingerprint.js";

// TODO: Maybe this doesn't need access to Conversation/ConversationEntity?
export default class DocumentCreator {
  constructor(
    private repos: DataRepositories,
    private usecases: {
      documentsCreate: DocumentsCreate;
    },
    private collections: Collection[],
    private llm: {
      generateNextMessage(
        previousMessages: Message[],
        // TODO: tools
      ): Promise<Message.Assistant>;
    },
  ) {}

  async start(
    assistant: Assistant,
    format: ConversationFormat,
    userMessageContent: Message.User["content"],
  ): Promise<ConversationEntity> {
    // const { success, data: collections } =
    //   await this.usecases.collectionsList.exec();
    // if (!success) {
    //   throw new UnexpectedAssistantError("Listing collections failed.");
    // }

    const now = new Date();
    const userMessage: Message.User = {
      role: MessageRole.User,
      content: userMessageContent,
      createdAt: now,
    };
    const conversation: ConversationEntity = {
      id: Id.generate.conversation(),
      format: format,
      assistant: assistant,
      title: userMessageContent[0].text,
      conversationContextFingerprint: await getContextFingerprint(
        this.collections,
      ),
      status: ConversationStatus.GeneratingNextMessage,
      messages: [userMessage],
      createdAt: new Date(),
    };
    await this.repos.conversation.upsert(conversation);

    await this.generateAndProcessNextMessage(conversation);

    return this.repos.conversation.find(
      conversation.id,
    ) as Promise<ConversationEntity>;
  }

  async continue(
    conversation: ConversationEntity,
    userMessageContent: Message.User["content"],
  ): Promise<ConversationEntity> {
    const userMessage: Message.User = {
      role: MessageRole.User,
      content: userMessageContent,
      createdAt: new Date(),
    };
    await this.repos.conversation.upsert({
      ...conversation,
      status: ConversationStatus.GeneratingNextMessage,
      messages: [...conversation.messages, userMessage],
    });

    await this.generateAndProcessNextMessage(conversation);

    return this.repos.conversation.find(
      conversation.id,
    ) as Promise<ConversationEntity>;
  }

  private async generateAndProcessNextMessage(
    conversation: ConversationEntity,
  ): Promise<void> {
    const assistantMessage = await this.llm.generateNextMessage(
      [
        {
          role: MessageRole.Developer,
          content: [{ type: MessageContentPartType.Text, text: developer() }],
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
        ...conversation.messages,
      ],
      // TODO: pass in tools
    );

    // Case: assistantMessage is Message.ContentAssistant
    if ("content" in assistantMessage) {
      await this.repos.conversation.upsert({
        ...conversation,
        status: ConversationStatus.Idle,
        messages: [...conversation.messages, assistantMessage],
      });
      return;
    }

    // Case: assistantMessage is Message.ToolCallAssistant with a single
    // ToolCall.CompleteConversation.
    if (
      assistantMessage.toolCalls.length === 1 &&
      CompleteConversation.is(assistantMessage.toolCalls[0]!)
    ) {
      this.repos.conversation.upsert({
        ...conversation,
        status: ConversationStatus.Completed,
        messages: [...conversation.messages, assistantMessage],
      });
      return;
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
    await this.generateAndProcessNextMessage({
      ...conversation,
      messages: [...conversation.messages, assistantMessage, toolMessage],
    });
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
