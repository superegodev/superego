import {
  type Collection,
  type ConversationId,
  DocumentVersionCreator,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeResultError from "../../../makers/makeResultError.js";
import makeSuccessfulResult from "../../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../../makers/makeUnsuccessfulResult.js";
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
    const { collectionId, id, latestVersionId, content } = toolCall.input;

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

    const createNewVersionResult = await documentsCreateNewVersion.exec(
      collectionId,
      id,
      latestVersionId,
      content,
      DocumentVersionCreator.Assistant,
      conversationId,
    );

    if (
      createNewVersionResult.error &&
      createNewVersionResult.error.name === "UnexpectedError"
    ) {
      throw new UnexpectedAssistantError(
        `Creating new document version failed with UnexpectedError. Cause: ${createNewVersionResult.error.details.cause}`,
      );
    }

    if (!createNewVersionResult.success) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(createNewVersionResult.error),
      };
    }

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult({
        collectionId: createNewVersionResult.data.collectionId,
        documentId: createNewVersionResult.data.id,
        documentVersionId: createNewVersionResult.data.latestVersion.id,
      }),
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
          // EVOLUTION: consider either using patches or even a js function that
          // modifies the document, as for complex documents this won't really
          // work.
          content: {
            description: `
Full content for the new version (complete replace, not a patch).

### Notes

- Never drop fields accidentally; start from the current content and edit only
  what changed.
            `.trim(),
            type: "object",
          },
        },
        required: ["collectionId", "id", "latestVersionId", "content"],
        additionalProperties: false,
      },
    };
  },
};
