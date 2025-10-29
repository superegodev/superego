import {
  type Collection,
  type CollectionCategory,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import { DataType, formats } from "@superego/schema";
import SchemaTypescriptSchema from "@superego/schema/SchemaTypescriptSchema";
import { DateTime } from "luxon";
import type InferenceService from "../../requirements/InferenceService.js";
import type CollectionsCreate from "../../usecases/collections/Create.js";
import Assistant from "../Assistant.js";
import Unknown from "../shared-tools/Unknown.js";
import defaultDeveloperPrompt from "./default-developer-prompt.md?raw";
import SuggestCollectionDefinition from "./tools/SuggestCollectionDefinition.js";

export default class CollectionCreatorAssistant extends Assistant {
  constructor(
    private developerPrompt: string | null,
    protected inferenceService: InferenceService,
    private collectionCategories: CollectionCategory[],
    private collections: Collection[],
    private usecases: {
      collectionsCreate: CollectionsCreate;
    },
  ) {
    super();
  }

  static getDefaultDeveloperPrompt(): string {
    return defaultDeveloperPrompt;
  }

  protected getDeveloperPrompt(): string {
    return (this.developerPrompt ?? defaultDeveloperPrompt)
      .replaceAll("\n<!-- prettier-ignore-start -->", "")
      .replaceAll("\n<!-- prettier-ignore-end -->", "")
      .replaceAll(
        "$TOOL_NAME_SUGGEST_COLLECTION_DEFINITION",
        ToolName.SuggestCollectionDefinition,
      )
      .replaceAll("$SUPEREGO_SCHEMA_TYPESCRIPT_SCHEMA", SchemaTypescriptSchema)
      .replaceAll(
        "$WELL_KNOWN_FORMATS_STRINGS",
        CollectionCreatorAssistant.wellKnownFormats(DataType.String),
      )
      .replaceAll(
        "$WELL_KNOWN_FORMATS_NUMBERS",
        CollectionCreatorAssistant.wellKnownFormats(DataType.Number),
      )
      .replaceAll(
        "$WELL_KNOWN_FORMATS_JSON_OBJECTS",
        CollectionCreatorAssistant.wellKnownFormats(DataType.JsonObject),
      );
  }

  protected getUserContextPrompt(): string {
    const now = DateTime.now();
    return [
      "<collection-categories>",
      JSON.stringify(
        this.collectionCategories.map((collectionCategory) => ({
          id: collectionCategory.id,
          parentId: collectionCategory.parentId,
          name: collectionCategory.name,
        })),
      ),
      "</collection-categories>",
      "<collections>",
      JSON.stringify(
        this.collections.map((collection) => ({
          id: collection.id,
          settings: {
            name: collection.settings.name,
            collectionCategoryId: collection.settings.collectionCategoryId,
          },
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
    return [SuggestCollectionDefinition.get()];
  }

  protected async processToolCall(toolCall: ToolCall): Promise<ToolResult> {
    if (SuggestCollectionDefinition.is(toolCall)) {
      return SuggestCollectionDefinition.exec(
        toolCall,
        this.usecases.collectionsCreate,
      );
    }
    return Unknown.exec(toolCall);
  }

  private static wellKnownFormats(dataType: DataType): string {
    return formats
      .filter((format) => format.dataType === dataType)
      .map((format) => `- \`${format.id}\`: ${format.description}`)
      .join("\n");
  }
}
