import {
  type Collection,
  type ConversationId,
  DocumentContentChangeType,
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
import type DocumentsCreateNewVersion from "../../../usecases/documents/CreateNewVersion.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.CreateNewDocumentVersion {
    return toolCall.tool === ToolName.CreateNewDocumentVersion;
  },

  async exec(
    toolCall: ToolCall.CreateNewDocumentVersion,
    conversationId: ConversationId,
    collections: Collection[],
    documentsCreateNewVersion: DocumentsCreateNewVersion,
  ): Promise<ToolResult.CreateNewDocumentVersion> {
    const { collectionId, id, latestVersionId, contentChange } = toolCall.input;

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
    } = await documentsCreateNewVersion.exec(
      collectionId,
      id,
      latestVersionId,
      contentChange,
      {
        createdBy: DocumentVersionCreator.Assistant,
        conversationId: conversationId,
      },
    );

    if (error && error.name === "UnexpectedError") {
      throw new UnexpectedAssistantError(
        `Creating new document version failed with UnexpectedError. Cause: ${error.details.cause}`,
      );
    }

    if (!success) {
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
        collectionId: document.collectionId,
        documentId: document.id,
        documentVersionId: document.latestVersion.id,
      }),
      artifacts: {
        document: makeLiteDocument(document),
      },
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.CreateNewDocumentVersion,
      description:
        "Use this when you want to update a document. It does so by creating a **new immutable version** of an existing document.",
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
          },
          id: {
            description: "The document ID to version.",
            type: "string",
          },
          latestVersionId: {
            description: `
Optimistic concurrency check. Set this to the versionId you just read. If it
doesn't match the actual latest version, the call must fail with a conflict.
Then re-read the document and try again.
            `.trim(),
            type: "string",
          },
          contentChange: {
            description: `
How to create the new version.

### Notes

- Prefer \`{ type: "patch", patch: [...] }\` for small edits.
- Use RFC 6902 JSON Patch paths, for example \`/status\` or \`/items/0/name\`.
- Use \`{ type: "full", content: ... }\` only when replacing the full document
  intentionally.
            `.trim(),
            oneOf: [
              {
                type: "object",
                properties: {
                  type: { const: DocumentContentChangeType.Full },
                  content: { type: "object" },
                },
                required: ["type", "content"],
                additionalProperties: false,
              },
              {
                type: "object",
                properties: {
                  type: { const: DocumentContentChangeType.Patch },
                  patch: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        op: {
                          enum: [
                            "add",
                            "remove",
                            "replace",
                            "move",
                            "copy",
                            "test",
                          ],
                        },
                        path: { type: "string" },
                        from: { type: "string" },
                        value: {},
                      },
                      required: ["op", "path"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["type", "patch"],
                additionalProperties: false,
              },
            ],
          },
        },
        required: ["collectionId", "id", "latestVersionId", "contentChange"],
        additionalProperties: false,
      },
    };
  },
};
