import type {
  Collection,
  CollectionId,
  ToolCall,
  ToolResult,
} from "@superego/backend";
import { jsonschemagen } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeSuccessfulToolResultOutput from "../../../makers/makeSuccessfulToolResultOutput.js";
import makeUnsuccessfulToolResultOutput from "../../../makers/makeUnsuccessfulToolResultOutput.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type DocumentsCreate from "../../../usecases/documents/Create.js";
import formatDescription from "../../../utils/formatDescription.js";

const toolNameSuffix = ".create_document" as const;
function extractPrefix(toolName: string): string {
  return toolName.slice(0, -toolNameSuffix.length);
}

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.CreateDocumentForCollection {
    return (
      toolCall.tool.endsWith(toolNameSuffix) &&
      Id.is.collection(extractPrefix(toolCall.tool))
    );
  },

  async exec(
    toolCall: ToolCall.CreateDocumentForCollection,
    documentsCreate: DocumentsCreate,
  ): Promise<ToolResult.CreateDocumentForCollection> {
    const collectionId = extractPrefix(toolCall.tool) as CollectionId;

    const {
      success,
      data: document,
      error,
    } = await documentsCreate.exec(collectionId, toolCall.input);

    if (error && error.name === "UnexpectedError") {
      throw new UnexpectedAssistantError(
        `Creating document failed with UnexpectedError. Cause: ${error.details.cause}`,
      );
    }

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: success
        ? makeSuccessfulToolResultOutput({
            collectionId: document.collectionId,
            documentId: document.id,
            documentVersionId: document.latestVersion.id,
          })
        : makeUnsuccessfulToolResultOutput(error),
    };
  },

  get(collection: Collection): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: `${collection.id}${toolNameSuffix}`,
      description: formatDescription(`
        Creates a document in collection "${collection.settings.name}"
        (collection id = ${collection.id}).
      `),
      inputSchema: jsonschemagen(collection.latestVersion.schema),
    };
  },
};
