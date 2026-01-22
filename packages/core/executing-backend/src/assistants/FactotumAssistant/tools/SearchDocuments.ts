import {
  type CollectionId,
  type DocumentId,
  type DocumentVersionId,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
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
    const { searches } = toolCall.input;

    const searchResults: {
      documents: {
        collectionId: CollectionId;
        id: DocumentId;
        versionId: DocumentVersionId;
        content: any;
      }[];
    }[] = [];

    for (const { collectionId, query, limit = 3 } of searches) {
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
        throw new UnexpectedAssistantError(
          `Searching documents failed with UnexpectedError. Cause: ${error.details.cause}`,
        );
      }

      searchResults.push({
        documents: data.map((result) => ({
          collectionId: result.match.collectionId,
          id: result.match.id,
          versionId: result.match.latestVersion.id,
          content: result.match.latestVersion.content,
        })),
      });
    }

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult({ results: searchResults }),
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.SearchDocuments,
      description: `
Performs lexical searches for documents. Each query matches documents containing
ALL terms in the query. Use separate searches for synonyms or alternative terms.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          searches: {
            description: "List of search queries to execute.",
            type: "array",
            items: {
              type: "object",
              properties: {
                collectionId: {
                  type: ["string", "null"],
                  description:
                    "The collection to search in, or null to search all collections.",
                },
                query: {
                  type: "string",
                  description:
                    "The search query text. Matches documents containing ALL terms.",
                },
                limit: {
                  type: "number",
                  description:
                    "Maximum number of results per query. Defaults to 3.",
                },
              },
              required: ["collectionId", "query"],
              additionalProperties: false,
            },
            minItems: 1,
          },
        },
        required: ["searches"],
        additionalProperties: false,
      },
    };
  },
};
