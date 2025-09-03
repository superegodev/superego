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
      description: `
Create a **new** document.

### Playbook

1. Fetch schema via \`db.getCollectionTypescriptSchema\`.
2. Gather every required field value (ask one precise question if anything
  required is missing).
3. Deduplicate using \`db.executeJavascriptFunction\`.
   - If identical → **skip** and say “Already exists.”
   - If same logical item but should change → use
     \`db.createNewDocumentVersion\`.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
            description:
              "ID of the target collection (e.g., 'Collection_1234567890').",
          },
          content: {
            type: "object",
            description: `
**Full content for the new document.** Must match the collection's TypeScript
schema.

### How to build \`content\`

- Include **only** fields defined by the schema.
- Use \`null\` **only** if the schema allows it.
- Respect units/currency as implied by the schema.
- **Do not** include system fields like \`id\` or \`versionId\` (they are
  assigned by the system).
            `.trim(),
          },
        },
        required: ["collectionId", "content"],
        additionalProperties: false,
      },
    };
  },
};
