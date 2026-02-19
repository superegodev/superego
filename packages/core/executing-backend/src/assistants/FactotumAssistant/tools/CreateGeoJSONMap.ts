import {
  type Collection,
  type CollectionId,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import LocalInstantTypeDeclaration from "@superego/javascript-sandbox-global-utils/LocalInstant.d.ts?raw";
import { codegen } from "@superego/schema";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import { DateTime } from "luxon";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeResultError from "../../../makers/makeResultError.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type JavascriptSandbox from "../../../requirements/JavascriptSandbox.js";
import type TypescriptCompiler from "../../../requirements/TypescriptCompiler.js";
import type DocumentsList from "../../../usecases/documents/List.js";
import createMarkdownElementId from "../../utils/createMarkdownElementId.js";
import type AssistantDocument from "../utils/AssistantDocument.js";
import { toAssistantDocument } from "../utils/AssistantDocument.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.CreateGeoJSONMap {
    return toolCall.tool === ToolName.CreateGeoJSONMap;
  },

  async exec(
    toolCall: ToolCall.CreateGeoJSONMap,
    collections: Collection[],
    documentsList: DocumentsList,
    javascriptSandbox: JavascriptSandbox,
    typescriptCompiler: TypescriptCompiler,
  ): Promise<ToolResult.CreateGeoJSONMap> {
    const { collectionIds, getGeoJSON: getGeoJSONTs } = toolCall.input;
    const uniqueCollectionIds = [...new Set(collectionIds)];
    const collectionsById = new Map(
      collections.map((collection) => [collection.id, collection]),
    );
    const missingCollectionId = uniqueCollectionIds.find(
      (collectionId) => !collectionsById.has(collectionId),
    );
    if (missingCollectionId) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", {
            collectionId: missingCollectionId,
          }),
        ),
      };
    }

    const typeDeclarations = uniqueCollectionIds.map((collectionId) => {
      const collection = collectionsById.get(collectionId)!;
      return {
        path: `/${collectionId}.ts` as `/${string}.ts`,
        source: codegen(collection.latestVersion.schema),
      };
    });

    const { data: getGeoJSONJs, error: compileError } =
      await typescriptCompiler.compile(
        { path: "/getGeoJSON.ts", source: getGeoJSONTs },
        [
          ...typeDeclarations,
          {
            path: "/LocalInstant.d.ts",
            source: LocalInstantTypeDeclaration,
          },
        ],
      );
    if (compileError) {
      if (compileError.name === "UnexpectedError") {
        throw new UnexpectedAssistantError(
          [
            `Compiling getGeoJSON failed with ${compileError.name}.`,
            ` Cause: ${compileError.details.cause}`,
          ].join(""),
        );
      }
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(compileError),
      };
    }

    const documentsByCollection: Record<CollectionId, AssistantDocument[]> = {};

    for (const collectionId of uniqueCollectionIds) {
      const { data: documents, error: documentsListError } =
        await documentsList.exec(collectionId, false);
      if (documentsListError) {
        throw new UnexpectedAssistantError(
          [
            `Listing documents failed with ${documentsListError.name}.`,
            documentsListError.name === "UnexpectedError"
              ? ` Cause: ${documentsListError.details.cause}`
              : "",
          ].join(""),
        );
      }
      const collection = collectionsById.get(collectionId)!;
      documentsByCollection[collectionId] = documents.map((document) =>
        toAssistantDocument(
          collection.latestVersion.schema,
          document,
          DateTime.local().zoneName,
        ),
      );
    }

    const result = await javascriptSandbox.executeSyncFunction(
      { source: "", compiled: getGeoJSONJs },
      [documentsByCollection],
    );

    if (!result.success) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: result,
      };
    }

    const issues: { message: string; path: { key: string }[] }[] = [];

    if (!result.data) {
      issues.push({
        message: "Missing geoJSON.",
        path: [],
      });
    } else if (typeof result.data !== "object") {
      issues.push({
        message: "geoJSON is not an object.",
        path: [],
      });
    }

    if (issues.length > 0) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(
          makeResultError("GeoJSONNotValid", { issues }),
        ),
      };
    }

    const geoJSONMapId = createMarkdownElementId();
    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult({
        markdownSnippet: `<GeoJSONMap id="${geoJSONMapId}" />`,
      }),
      artifacts: {
        geoJSONMapId,
        geoJSON: result.data,
      },
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.CreateGeoJSONMap,
      description: `
Creates a geographical map that you can use in your textual responses by
including verbatim the \`markdownSnippet\` returned by the tool call.

This tool is a variant of ${ToolName.ExecuteTypescriptFunction}.

\`getGeoJSON\`:

- Takes the same parameters as the function in ${ToolName.ExecuteTypescriptFunction}
  (documents grouped by collection).
- Executes in the same environment.
- **Must** abide by ALL its rules.
- **Must** return a valid geoJSON object. The object **can** include the
  JsonObject branding (__dataType: "JsonObject").

Call this tool directly. DO NOT chain it to an ${ToolName.ExecuteTypescriptFunction}
tool call.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionIds: {
            type: "array",
            items: { type: "string" },
          },
          getGeoJSON: {
            description:
              "TypeScript function returning a geoJSON object. `export default function getGeoJSON(documentsByCollection: DocumentsByCollection): object {}`",
            type: "string",
          },
        },
        required: ["collectionIds", "getGeoJSON"],
        additionalProperties: false,
      },
    };
  },
};
