import { type ToolCall, ToolName, type ToolResult } from "@superego/backend";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
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
    documentsCreateNewVersion: DocumentsCreateNewVersion,
  ): Promise<ToolResult.CreateNewDocumentVersion> {
    const { collectionId, id, latestVersionId, content } = toolCall.input;

    const {
      success,
      data: document,
      error,
    } = await documentsCreateNewVersion.exec(
      collectionId,
      id,
      latestVersionId,
      content,
    );

    if (error && error.name === "UnexpectedError") {
      throw new UnexpectedAssistantError(
        `Creating new document version failed with UnexpectedError. Cause: ${error.details.cause}`,
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
      name: ToolName.CreateNewDocumentVersion,
      description: `
Create a **new immutable version** of an existing document.

### Playbook

1. Read current \`content\` and \`versionId\` (via
   \`db.executeJavascriptFunction\` by \`id\`).
2. Copy current content; change **only** requested fields.
3. Validate against schema.
4. Call with the \`latestVersionId\` you just read. If conflict, re-read and
   retry.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
            description:
              "ID of the collection that contains the document (e.g., 'Collection_1234567890').",
          },
          id: {
            type: "string",
            description:
              "The document ID to version (the stable identifier of the document).",
          },
          latestVersionId: {
            type: "string",
            description: `
Optimistic concurrency check. Set this to the versionId you just read. If it
doesn't match the actual latest version, the call must fail with a conflict.
Then re-read the document and try again.
            `.trim(),
          },
          content: {
            type: "object",
            description: `
Full content for the new version (complete replace, not a patch).

### Notes

- Never drop fields accidentally; start from the current content and edit only
  what changed.
            `.trim(),
          },
        },
        required: ["collectionId", "id", "latestVersionId", "content"],
        additionalProperties: false,
      },
    };
  },
};
