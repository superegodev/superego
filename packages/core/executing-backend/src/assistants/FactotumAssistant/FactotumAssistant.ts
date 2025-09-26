import {
  type Collection,
  type ConversationId,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import { DateTime } from "luxon";
import type InferenceService from "../../requirements/InferenceService.js";
import type JavascriptSandbox from "../../requirements/JavascriptSandbox.js";
import type DocumentsCreate from "../../usecases/documents/Create.js";
import type DocumentsCreateNewVersion from "../../usecases/documents/CreateNewVersion.js";
import type DocumentsList from "../../usecases/documents/List.js";
import Assistant from "../Assistant.js";
import defaultDeveloperPrompt from "./default-developer-prompt.md?raw";
import CreateChart from "./tools/CreateChart.js";
import CreateDocuments from "./tools/CreateDocuments.js";
import CreateDocumentsTable from "./tools/CreateDocumentsTable.js";
import CreateNewDocumentVersion from "./tools/CreateNewDocumentVersion.js";
import ExecuteJavascriptFunction from "./tools/ExecuteJavascriptFunction.js";
import GetCollectionTypescriptSchema from "./tools/GetCollectionTypescriptSchema.js";
import Unknown from "./tools/Unknown.js";

export default class FactotumAssistant extends Assistant {
  constructor(
    private conversationId: ConversationId,
    private userName: string | null,
    private developerPrompt: string | null,
    protected inferenceService: InferenceService,
    private collections: Collection[],
    private usecases: {
      documentsCreate: DocumentsCreate;
      documentsCreateNewVersion: DocumentsCreateNewVersion;
      documentsList: DocumentsList;
    },
    private javascriptSandbox: JavascriptSandbox,
  ) {
    super();
  }

  static getDefaultDeveloperPrompt(): string {
    return defaultDeveloperPrompt;
  }

  protected getDeveloperPrompt(): string {
    return (this.developerPrompt ?? defaultDeveloperPrompt)
      .replaceAll("$USER_NAME", this.userName ?? "Alex")
      .replaceAll("$TOOL_NAME_CREATE_DOCUMENTS", ToolName.CreateDocuments)
      .replaceAll(
        "$TOOL_NAME_CREATE_NEW_DOCUMENT_VERSION",
        ToolName.CreateNewDocumentVersion,
      )
      .replaceAll(
        "$TOOL_NAME_EXECUTE_JAVASCRIPT_FUNCTION",
        ToolName.ExecuteJavascriptFunction,
      )
      .replaceAll(
        "$TOOL_NAME_GET_COLLECTION_TYPESCRIPT_SCHEMA",
        ToolName.GetCollectionTypescriptSchema,
      )
      .replaceAll("$TOOL_NAME_RENDER_CHART", ToolName.CreateChart)
      .replaceAll(
        "$TOOL_NAME_RENDER_DOCUMENTS_TABLE",
        ToolName.CreateDocumentsTable,
      );
  }

  protected getUserContextPrompt(): string {
    const now = DateTime.now();
    return [
      "<collections>",
      JSON.stringify(
        this.collections.map((collection) => ({
          id: collection.id,
          name: collection.settings.name,
          description: collection.settings.description,
          assistantInstructions: collection.settings.assistantInstructions,
        })),
      ),
      "</collections>",
      "<local-date-time>",
      now.toISO({
        precision: "millisecond",
        includeOffset: true,
        extendedZone: true,
      }),
      "</local-date-time>",
      "<weekday>",
      now.toFormat("cccc"),
      "<weekday>",
    ].join("\n");
  }

  protected getTools(): InferenceService.Tool[] {
    return [
      GetCollectionTypescriptSchema.get(),
      ExecuteJavascriptFunction.get(),
      CreateDocuments.get(),
      CreateNewDocumentVersion.get(),
      CreateChart.get(),
      CreateDocumentsTable.get(),
    ];
  }

  protected async processToolCall(toolCall: ToolCall): Promise<ToolResult> {
    if (GetCollectionTypescriptSchema.is(toolCall)) {
      return GetCollectionTypescriptSchema.exec(toolCall, this.collections);
    }
    if (ExecuteJavascriptFunction.is(toolCall)) {
      return ExecuteJavascriptFunction.exec(
        toolCall,
        this.collections,
        this.usecases.documentsList,
        this.javascriptSandbox,
      );
    }
    if (CreateDocuments.is(toolCall)) {
      return CreateDocuments.exec(
        toolCall,
        this.conversationId,
        this.collections,
        this.usecases.documentsCreate,
      );
    }
    if (CreateNewDocumentVersion.is(toolCall)) {
      return CreateNewDocumentVersion.exec(
        toolCall,
        this.conversationId,
        this.collections,
        this.usecases.documentsCreateNewVersion,
      );
    }
    if (CreateChart.is(toolCall)) {
      return CreateChart.exec(
        toolCall,
        this.collections,
        this.usecases.documentsList,
        this.javascriptSandbox,
      );
    }
    if (CreateDocumentsTable.is(toolCall)) {
      return CreateDocumentsTable.exec(
        toolCall,
        this.collections,
        this.usecases.documentsList,
        this.javascriptSandbox,
      );
    }
    return Unknown.exec(toolCall);
  }
}
