import type { Collection, ToolCall, ToolResult } from "@superego/backend";
import { DateTime } from "luxon";
import type InferenceService from "../../requirements/InferenceService.js";
import type JavascriptSandbox from "../../requirements/JavascriptSandbox.js";
import type DocumentsCreate from "../../usecases/documents/Create.js";
import type DocumentsCreateNewVersion from "../../usecases/documents/CreateNewVersion.js";
import type DocumentsList from "../../usecases/documents/List.js";
import Assistant from "../Assistant.js";
import defaultDeveloperPrompt from "./default-developer-prompt.md?raw";
import CreateDocument from "./tools/CreateDocument.js";
import CreateNewDocumentVersion from "./tools/CreateNewDocumentVersion.js";
import ExecuteJavascriptFunction from "./tools/ExecuteJavascriptFunction.js";
import GetCollectionTypescriptSchema from "./tools/GetCollectionTypescriptSchema.js";
import Unknown from "./tools/Unknown.js";

export default class FactotumAssistant extends Assistant {
  constructor(
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
    return (this.developerPrompt ?? defaultDeveloperPrompt).replaceAll(
      "$USER_NAME",
      this.userName ?? "Alex",
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
      CreateDocument.get(),
      CreateNewDocumentVersion.get(),
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
    if (CreateDocument.is(toolCall)) {
      return CreateDocument.exec(
        toolCall,
        this.collections,
        this.usecases.documentsCreate,
      );
    }
    if (CreateNewDocumentVersion.is(toolCall)) {
      return CreateNewDocumentVersion.exec(
        toolCall,
        this.collections,
        this.usecases.documentsCreateNewVersion,
      );
    }
    return Unknown.exec(toolCall);
  }
}
