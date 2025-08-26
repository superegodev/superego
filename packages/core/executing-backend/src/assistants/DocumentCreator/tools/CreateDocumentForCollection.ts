import type { CollectionId, ToolCall, ToolResult } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeSuccessfulToolResultOutput from "../../../makers/makeSuccessfulToolResultOutput.js";
import makeUnsuccessfulToolResultOutput from "../../../makers/makeUnsuccessfulToolResultOutput.js";
import type DocumentsCreate from "../../../usecases/documents/Create.js";

const toolPrefix = "create_document_for_" as const;

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.CreateDocumentForCollection {
    return (
      toolCall.tool.startsWith(toolPrefix) &&
      Id.is.collection(toolCall.tool.slice(toolPrefix.length))
    );
  },

  async exec(
    toolCall: ToolCall.CreateDocumentForCollection,
    documentsCreate: DocumentsCreate,
  ): Promise<ToolResult.CreateDocumentForCollection> {
    const collectionId = toolCall.tool.slice(toolPrefix.length) as CollectionId;

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
};
