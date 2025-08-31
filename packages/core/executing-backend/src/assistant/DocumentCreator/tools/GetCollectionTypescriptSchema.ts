import type { Collection, ToolCall, ToolResult } from "@superego/backend";
import { codegen } from "@superego/schema";
import makeResultError from "../../../makers/makeResultError.js";
import makeSuccessfulResult from "../../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../../makers/makeUnsuccessfulResult.js";
import InferenceService from "../../../requirements/InferenceService.js";
import formatDescription from "../../../utils/formatDescription.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.GetCollectionTypescriptSchema {
    return toolCall.tool === "getCollectionTypescriptSchema";
  },

  async exec(
    toolCall: ToolCall.GetCollectionTypescriptSchema,
    collections: Collection[],
  ): Promise<ToolResult.GetCollectionTypescriptSchema> {
    const { collectionId } = toolCall.input;
    const collection = collections.find(({ id }) => id === collectionId);
    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: collection
        ? makeSuccessfulResult({
            typescriptSchema: codegen(collection.latestVersion.schema),
          })
        : makeUnsuccessfulResult(
            makeResultError("CollectionNotFound", { collectionId }),
          ),
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: "getCollectionTypescriptSchema",
      description: formatDescription(`
        Gets the set of TypeScript types that describe the shape of a document
        in the collection specified collection. Note: the type denoted as the
        "root type" is the one that describes the document; the other types - if
        there are any - are auxiliary.
      `),
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
            description: formatDescription(`
              The ID of the collection whose TypeScript schema we want to
              retrieve.
            `),
          },
        },
        required: ["collectionId"],
        additionalProperties: false,
      },
    };
  },
};
