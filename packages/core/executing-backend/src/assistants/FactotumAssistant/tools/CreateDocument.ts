import {
  type Collection,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeResultError from "../../../makers/makeResultError.js";
import makeSuccessfulResult from "../../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../../makers/makeUnsuccessfulResult.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type DocumentsCreate from "../../../usecases/documents/Create.js";
import { fromAssistantContent } from "../../utils/AssistantDocument.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.CreateDocument {
    return toolCall.tool === ToolName.CreateDocument;
  },

  async exec(
    toolCall: ToolCall.CreateDocument,
    collections: Collection[],
    documentsCreate: DocumentsCreate,
  ): Promise<ToolResult.CreateDocument> {
    const { collectionId, content } = toolCall.input;

    const collection = collections.find(({ id }) => id === collectionId);
    if (!collection) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", { collectionId }),
        ),
      };
    }

    const {
      success,
      data: document,
      error,
    } = await documentsCreate.exec(
      collectionId,
      fromAssistantContent(collection.latestVersion.schema, content),
    );

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
      description: "Creates a **new** document.",
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
          },
          content: {
            type: "object",
            description: [
              "Content for the new document.",
              "Content **ONLY**, never include document ids or version ids.",
              "Must match the collection's TypeScript schema.",
            ].join(" "),
          },
        },
        required: ["collectionId", "content"],
        additionalProperties: false,
      },
    };
  },
};
