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
import type TypescriptCompiler from "../../requirements/TypescriptCompiler.js";
import type DocumentsCreateMany from "../../usecases/documents/CreateMany.js";
import type DocumentsCreateNewVersion from "../../usecases/documents/CreateNewVersion.js";
import type DocumentsList from "../../usecases/documents/List.js";
import type DocumentsSearch from "../../usecases/documents/Search.js";
import type FilesGetContent from "../../usecases/files/GetContent.js";
import Assistant from "../Assistant.js";
import InspectFile from "../shared-tools/InspectFile.js";
import Unknown from "../shared-tools/Unknown.js";
import defaultDeveloperPrompt from "./default-developer-prompt.md?raw";
import CreateChart from "./tools/CreateChart.js";
import CreateDocuments from "./tools/CreateDocuments.js";
import CreateDocumentsTables from "./tools/CreateDocumentsTables.js";
import CreateMap from "./tools/CreateMap.js";
import CreateNewDocumentVersion from "./tools/CreateNewDocumentVersion.js";
import ExecuteTypescriptFunction from "./tools/ExecuteTypescriptFunction.js";
import GetCollectionTypescriptSchema from "./tools/GetCollectionTypescriptSchema.js";
import SearchDocuments from "./tools/SearchDocuments.js";

export default class FactotumAssistant extends Assistant {
  constructor(
    private conversationId: ConversationId,
    private userName: string | null,
    private developerPrompt: string | null,
    protected inferenceService: InferenceService,
    private collections: Collection[],
    private usecases: {
      documentsCreateMany: DocumentsCreateMany;
      documentsCreateNewVersion: DocumentsCreateNewVersion;
      documentsList: DocumentsList;
      documentsSearch: DocumentsSearch;
      filesGetContent: FilesGetContent;
    },
    private javascriptSandbox: JavascriptSandbox,
    private typescriptCompiler: TypescriptCompiler,
    private savepoint: {
      create: () => Promise<string>;
      rollbackTo: (name: string) => Promise<void>;
    },
  ) {
    super();
  }

  static getDefaultDeveloperPrompt(): string {
    return defaultDeveloperPrompt;
  }

  protected getDeveloperPrompt(): string {
    return (this.developerPrompt ?? defaultDeveloperPrompt)
      .replaceAll(
        "$USER_IDENTITY",
        this.userName
          ? [
              "User identity:",
              `- Name: ${this.userName}.`,
              `- Canonical reference: “the user” (${this.userName}).`,
              "- Safety: do not infer traits from the name. Do not invent personal facts.",
              "- Pronouns: use they/them unless provided; otherwise mirror the user's own usage.",
              `- Coreference: “I/me/my” in user messages refers to ${this.userName};`,
              `  “you/your” in assistant replies refers to ${this.userName}.`,
            ].join("\n")
          : "",
      )
      .replaceAll("$TOOL_NAME_CREATE_DOCUMENTS", ToolName.CreateDocuments)
      .replaceAll(
        "$TOOL_NAME_CREATE_NEW_DOCUMENT_VERSION",
        ToolName.CreateNewDocumentVersion,
      )
      .replaceAll(
        "$TOOL_NAME_EXECUTE_TYPESCRIPT_FUNCTION",
        ToolName.ExecuteTypescriptFunction,
      )
      .replaceAll(
        "$TOOL_NAME_GET_COLLECTION_TYPESCRIPT_SCHEMA",
        ToolName.GetCollectionTypescriptSchema,
      )
      .replaceAll("$TOOL_NAME_CREATE_CHART", ToolName.CreateChart)
      .replaceAll("$TOOL_NAME_CREATE_MAP", ToolName.CreateMap)
      .replaceAll(
        "$TOOL_NAME_CREATE_DOCUMENTS_TABLE",
        ToolName.CreateDocumentsTables,
      )
      .replaceAll("$TOOL_NAME_SEARCH_DOCUMENTS", ToolName.SearchDocuments)
      .replaceAll("$TOOL_NAME_INSPECT_FILE", ToolName.InspectFile);
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
      now.toISO({ precision: "millisecond", includeOffset: true }),
      "</local-date-time>",
      "<user-time-zone>",
      now.zone.name,
      "</user-time-zone>",
      "<weekday>",
      now.toFormat("cccc"),
      "<weekday>",
    ].join("\n");
  }

  protected getTools(): InferenceService.Tool[] {
    return [
      GetCollectionTypescriptSchema.get(),
      ExecuteTypescriptFunction.get(),
      CreateDocuments.get(),
      CreateNewDocumentVersion.get(),
      CreateChart.get(),
      CreateMap.get(),
      CreateDocumentsTables.get(),
      SearchDocuments.get(),
      InspectFile.get(),
    ];
  }

  protected async processToolCall(toolCall: ToolCall): Promise<ToolResult> {
    if (GetCollectionTypescriptSchema.is(toolCall)) {
      return GetCollectionTypescriptSchema.exec(toolCall, this.collections);
    }
    if (ExecuteTypescriptFunction.is(toolCall)) {
      return ExecuteTypescriptFunction.exec(
        toolCall,
        this.collections,
        this.usecases.documentsList,
        this.javascriptSandbox,
        this.typescriptCompiler,
      );
    }
    if (CreateDocuments.is(toolCall)) {
      return CreateDocuments.exec(
        toolCall,
        this.conversationId,
        this.collections,
        this.usecases.documentsCreateMany,
        this.savepoint,
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
        this.typescriptCompiler,
      );
    }
    if (CreateMap.is(toolCall)) {
      return CreateMap.exec(
        toolCall,
        this.collections,
        this.usecases.documentsList,
        this.javascriptSandbox,
        this.typescriptCompiler,
      );
    }
    if (CreateDocumentsTables.is(toolCall)) {
      return CreateDocumentsTables.exec(
        toolCall,
        this.collections,
        this.usecases.documentsList,
        this.javascriptSandbox,
        this.typescriptCompiler,
      );
    }
    if (SearchDocuments.is(toolCall)) {
      return SearchDocuments.exec(toolCall, this.usecases.documentsSearch);
    }
    if (InspectFile.is(toolCall)) {
      return InspectFile.exec(
        toolCall,
        this.inferenceService,
        this.usecases.filesGetContent,
      );
    }
    return Unknown.exec(toolCall);
  }
}
