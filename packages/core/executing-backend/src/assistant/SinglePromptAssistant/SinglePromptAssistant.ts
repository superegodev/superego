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
import type JavascriptSandbox from "../../requirements/JavascriptSandbox.js";
import type DocumentsCreate from "../../usecases/documents/Create.js";
import type DocumentsCreateNewVersion from "../../usecases/documents/CreateNewVersion.js";
import type DocumentsList from "../../usecases/documents/List.js";
import type Assistant from "../Assistant.js";
import developer from "./prompts/developer.js";
import userContext from "./prompts/userContext.js";
import CreateDocument from "./tools/CreateDocument.js";
import CreateNewDocumentVersion from "./tools/CreateNewDocumentVersion.js";
import ExecuteJavascriptFunction from "./tools/ExecuteJavascriptFunction.js";
import GetCollectionTypescriptSchema from "./tools/GetCollectionTypescriptSchema.js";
import Unknown from "./tools/Unknown.js";

export default class SinglePromptAssistant implements Assistant {
  constructor(
    private inferenceService: InferenceService,
    private collections: Collection[],
    private usecases: {
      documentsCreate: DocumentsCreate;
      documentsCreateNewVersion: DocumentsCreateNewVersion;
      documentsList: DocumentsList;
    },
    private javascriptSandbox: JavascriptSandbox,
  ) {}

  async generateAndProcessNextMessages(
    conversationFormat: ConversationFormat,
    messages: Message[],
  ): Promise<Message[]> {
    const assistantMessage = await this.inferenceService.generateNextMessage(
      [
        {
          role: MessageRole.Developer,
          content: [
            {
              type: MessageContentPartType.Text,
              text: developer(),
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
      this.getTools(),
    );

    // Case: assistantMessage is Message.ContentAssistant
    if ("content" in assistantMessage) {
      return [
        ...messages,
        { ...assistantMessage, agent: "SinglePromptAssistant" },
      ];
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
      { ...assistantMessage, agent: "SinglePromptAssistant" },
      toolMessage,
    ]);
  }

  private getTools(): InferenceService.Tool[] {
    return [
      GetCollectionTypescriptSchema.get(),
      ExecuteJavascriptFunction.get(),
      CreateDocument.get(),
      CreateNewDocumentVersion.get(),
    ];
  }

  private async processToolCall(toolCall: ToolCall): Promise<ToolResult> {
    if (GetCollectionTypescriptSchema.is(toolCall)) {
      return GetCollectionTypescriptSchema.exec(toolCall, this.collections);
    }
    if (ExecuteJavascriptFunction.is(toolCall)) {
      return ExecuteJavascriptFunction.exec(
        toolCall,
        this.usecases.documentsList,
        this.javascriptSandbox,
      );
    }
    if (CreateDocument.is(toolCall)) {
      return CreateDocument.exec(toolCall, this.usecases.documentsCreate);
    }
    if (CreateNewDocumentVersion.is(toolCall)) {
      return CreateNewDocumentVersion.exec(
        toolCall,
        this.usecases.documentsCreateNewVersion,
      );
    }
    return Unknown.exec(toolCall);
  }
}
