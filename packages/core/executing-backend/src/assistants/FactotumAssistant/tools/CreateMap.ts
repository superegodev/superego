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
  is(toolCall: ToolCall): toolCall is ToolCall.CreateMap {
    return toolCall.tool === ToolName.CreateMap;
  },

  async exec(
    toolCall: ToolCall.CreateMap,
    collections: Collection[],
    documentsList: DocumentsList,
    javascriptSandbox: JavascriptSandbox,
    typescriptCompiler: TypescriptCompiler,
  ): Promise<ToolResult.CreateMap> {
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
          {
            path: "/node_modules/geojson/index.d.ts",
            source: `
              declare module "geojson" {
                export interface Feature {
                  type: "Feature";
                  geometry: any;
                  properties?: Record<string, any> | null;
                  [key: string]: any;
                }
                export interface FeatureCollection {
                  type: "FeatureCollection";
                  features: Feature[];
                  [key: string]: any;
                }
              }
            `,
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

    const title = result.data?.title;
    if (typeof title !== "string" || title.trim() === "") {
      issues.push({
        message: "Missing or empty map title.",
        path: [{ key: "title" }],
      });
    }

    const geoJSON = result.data?.geoJSON;
    if (!geoJSON || typeof geoJSON !== "object") {
      issues.push({
        message: "Missing geoJSON property.",
        path: [{ key: "geoJSON" }],
      });
    } else {
      if (geoJSON.type !== "FeatureCollection") {
        issues.push({
          message: 'geoJSON.type must be "FeatureCollection".',
          path: [{ key: "geoJSON" }, { key: "type" }],
        });
      }
      if (!Array.isArray(geoJSON.features)) {
        issues.push({
          message: "geoJSON.features must be an array.",
          path: [{ key: "geoJSON" }, { key: "features" }],
        });
      }
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

    const mapId = createMarkdownElementId();
    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult({
        markdownSnippet: `<Map id="${mapId}" />`,
      }),
      artifacts: {
        mapId,
        title: title as string,
        geoJSON: geoJSON as { type: "FeatureCollection"; features: unknown[] },
      },
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.CreateMap,
      description: `
Creates a map that you can use in your textual responses by including verbatim
the \`markdownSnippet\` returned by the tool call.

This tool is a variant of ${ToolName.ExecuteTypescriptFunction}.

\`getGeoJSON\`:

- Takes the same parameters as the function in ${ToolName.ExecuteTypescriptFunction}
  (documents grouped by collection).
- Executes in the same environment.
- **Must** abide by ALL its rules.
- **Must** return an object with shape \`{ title: string; geoJSON: import("geojson").FeatureCollection }\`.

Call this tool directly. DO NOT chain it to an ${ToolName.ExecuteTypescriptFunction}
tool call.

### Additional MANDATORY rules

- Always set a title for the map.
- The \`geoJSON\` property **must** be a valid GeoJSON FeatureCollection.
- Each Feature should have meaningful \`properties\` for popup display.
- Use Point features for individual locations, LineString for routes/paths,
  and Polygon for areas/regions.
- Coordinates must be [longitude, latitude] (GeoJSON standard).
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
              'TypeScript function returning an object with title and GeoJSON FeatureCollection. `export default function getGeoJSON(documentsByCollection: DocumentsByCollection): { title: string; geoJSON: import("geojson").FeatureCollection } {}`',
            type: "string",
          },
        },
        required: ["collectionIds", "getGeoJSON"],
        additionalProperties: false,
      },
    };
  },
};
