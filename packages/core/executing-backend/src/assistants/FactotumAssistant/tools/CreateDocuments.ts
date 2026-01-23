import {
  type Collection,
  type ConversationId,
  DocumentVersionCreator,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeLiteDocument from "../../../makers/makeLiteDocument.js";
import makeResultError from "../../../makers/makeResultError.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type DocumentsCreateMany from "../../../usecases/documents/CreateMany.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.CreateDocuments {
    return toolCall.tool === ToolName.CreateDocuments;
  },

  async exec(
    toolCall: ToolCall.CreateDocuments,
    conversationId: ConversationId,
    collections: Collection[],
    documentsCreateMany: DocumentsCreateMany,
    savepoint: {
      create: () => Promise<string>;
      rollbackTo: (name: string) => Promise<void>;
    },
  ): Promise<ToolResult.CreateDocuments> {
    for (const { collectionId } of toolCall.input.documents) {
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
    }

    const beforeCreateSavepoint = await savepoint.create();
    const documents = toolCall.input.documents.map(
      ({ collectionId, content, skipDuplicateCheck }) => ({
        collectionId,
        content,
        ...(skipDuplicateCheck ? { options: { skipDuplicateCheck } } : null),
      }),
    );
    const {
      success,
      data: createdDocuments,
      error,
    } = await documentsCreateMany.exec(documents, {
      createdBy: DocumentVersionCreator.Assistant,
      conversationId: conversationId,
    });

    if (error && error.name === "UnexpectedError") {
      throw new UnexpectedAssistantError(
        `Creating documents failed with UnexpectedError. Cause: ${error.details.cause}`,
      );
    }

    if (!success) {
      await savepoint.rollbackTo(beforeCreateSavepoint);
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(error),
      };
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
      description: `
Atomically creates one or more documents in one or more collections.

Documents in the same batch can reference each other using ProtoDocument_<index>
as the documentId in DocumentRef properties, where <index> is the 0-based
position of the referenced document in the documents array.

When creating documents that reference each other, always use
ProtoDocument_<index> references in a single tool call instead of making
multiple separate calls.
      `.trim(),
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
                content: {
                  description: [
                    "Content for the new document.",
                    "Content **ONLY**, never include document ids or version ids.",
                    "Must match the collection's TypeScript schema.",
                  ].join(" "),
                  type: "object",
                },
                skipDuplicateCheck: {
                  description:
                    "Skip the duplicate document check. Defaults to false. Set to true only after DuplicateDocumentDetected error, if it's clear that the document to create is NOT a duplicate.",
                  type: "boolean",
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
