import {
  type Collection,
  type ConversationId,
  type Document,
  DocumentVersionCreator,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeLiteDocument from "../../../makers/makeLiteDocument.js";
import makeResultError from "../../../makers/makeResultError.js";
import makeSuccessfulResult from "../../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../../makers/makeUnsuccessfulResult.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type DocumentsCreate from "../../../usecases/documents/Create.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.CreateDocuments {
    return toolCall.tool === ToolName.CreateDocuments;
  },

  async exec(
    toolCall: ToolCall.CreateDocuments,
    conversationId: ConversationId,
    collections: Collection[],
    documentsCreate: DocumentsCreate,
  ): Promise<ToolResult.CreateDocuments> {
    const createdDocuments: Document[] = [];
    for (const { collectionId, content } of toolCall.input.documents) {
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
      } = await documentsCreate.exec(collectionId, content, {
        createdBy: DocumentVersionCreator.Assistant,
        conversationId: conversationId,
      });

      if (error && error.name === "UnexpectedError") {
        throw new UnexpectedAssistantError(
          `Creating document failed with UnexpectedError. Cause: ${error.details.cause}`,
        );
      }

      if (!success) {
        return {
          tool: toolCall.tool,
          toolCallId: toolCall.id,
          output: makeUnsuccessfulResult(error),
        };
      }

      createdDocuments.push(document);
    }

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult({
        documents: createdDocuments.map((document) => ({
          collectionId: document.collectionId,
          documentId: document.id,
          documentVersionId: document.latestVersion.id,
        })),
      }),
      artifacts: {
        documents: createdDocuments.map(makeLiteDocument),
      },
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.CreateDocuments,
      description:
        "Creates one or more **new** documents in one or more collections.",
      inputSchema: {
        type: "object",
        properties: {
          documents: {
            description: "List of documents to create.",
            type: "array",
            items: {
              type: "object",
              properties: {
                collectionId: {
                  type: "string",
                },
                // EVOLUTION: figure out how to support file creation. We could
                // pass a list of "temporary file refs" that are in the context
                // of the conversation and that the assistant can use.
                content: {
                  description: [
                    "Content for the new document.",
                    "Content **ONLY**, never include document ids or version ids.",
                    "Must match the collection's TypeScript schema.",
                  ].join(" "),
                  type: "object",
                },
              },
              required: ["collectionId", "content"],
              additionalProperties: false,
            },
            minItems: 1,
          },
        },
        required: ["documents"],
        additionalProperties: false,
      },
    };
  },
};
