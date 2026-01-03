import { type ToolCall, ToolName, type ToolResult } from "@superego/backend";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeResultError from "../../../makers/makeResultError.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type DocumentsSearch from "../../../usecases/documents/Search.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.SearchDocuments {
    return toolCall.tool === ToolName.SearchDocuments;
  },

  async exec(
    toolCall: ToolCall.SearchDocuments,
    documentsSearch: DocumentsSearch,
  ): Promise<ToolResult.SearchDocuments> {
    const { collectionId, query, limit = 3 } = toolCall.input;

    const { success, data, error } = await documentsSearch.exec(
      collectionId,
      query,
      { limit },
      false,
    );

    if (!success) {
      if (error.name === "CollectionNotFound") {
        return {
          tool: toolCall.tool,
          toolCallId: toolCall.id,
          output: makeUnsuccessfulResult(
            makeResultError("CollectionNotFound", {
              collectionId: error.details.collectionId,
            }),
          ),
        };
      }
      throw new Error(
        `Searching documents failed with UnexpectedError. Cause: ${error.details.cause}`,
      );
    }

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult({
        documents: data.map((result) => ({
          collectionId: result.match.collectionId,
          id: result.match.id,
          versionId: result.match.latestVersion.id,
          content: result.match.latestVersion.content,
        })),
      }),
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.SearchDocuments,
      description: `
Performs a lexical search for documents matching a text query. **Use it** to
find documents containing specific text or keywords.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: ["string", "null"],
            description:
              "The collection to search in, or null to search all collections.",
          },
          query: {
            type: "string",
            description: "The search query text.",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return. Defaults to 3.",
          },
        },
        required: ["collectionId", "query"],
        additionalProperties: false,
      },
    };
  },
};
