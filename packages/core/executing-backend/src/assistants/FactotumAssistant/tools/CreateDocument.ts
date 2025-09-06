import { type ToolCall, ToolName, type ToolResult } from "@superego/backend";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeSuccessfulResult from "../../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../../makers/makeUnsuccessfulResult.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type DocumentsCreate from "../../../usecases/documents/Create.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.CreateDocument {
    return toolCall.tool === ToolName.CreateDocument;
  },

  async exec(
    toolCall: ToolCall.CreateDocument,
    documentsCreate: DocumentsCreate,
  ): Promise<ToolResult.CreateDocument> {
    const { collectionId, content } = toolCall.input;

    // TODO: if necessary, try some easy fixes to the document (e.g., if a
    // property is not provided, but it's nullable, set it to null).
    const {
      success,
      data: document,
      error,
    } = await documentsCreate.exec(collectionId, content);

    if (error && error.name === "UnexpectedError") {
      throw new UnexpectedAssistantError(
        `Creating document failed with UnexpectedError. Cause: ${error.details.cause}`,
      );
    }

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: success
        ? makeSuccessfulResult({
            collectionId: document.collectionId,
            documentId: document.id,
            documentVersionId: document.latestVersion.id,
          })
        : makeUnsuccessfulResult(error),
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.CreateDocument,
      description: "Create a **new** document.",
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
          },
          content: {
            type: "object",
            description: `**Full content for the new document.** Must match the collection's TypeScript schema.`,
          },
        },
        required: ["collectionId", "content"],
        additionalProperties: false,
      },
    };
  },
};
