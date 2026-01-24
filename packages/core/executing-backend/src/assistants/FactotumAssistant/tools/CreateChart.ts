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
  is(toolCall: ToolCall): toolCall is ToolCall.CreateChart {
    return toolCall.tool === ToolName.CreateChart;
  },

  async exec(
    toolCall: ToolCall.CreateChart,
    collections: Collection[],
    documentsList: DocumentsList,
    javascriptSandbox: JavascriptSandbox,
    typescriptCompiler: TypescriptCompiler,
  ): Promise<ToolResult.CreateChart> {
    const { collectionIds, getEChartsOption: getEChartsOptionTs } =
      toolCall.input;
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

    const { data: getEChartsOptionJs, error: compileError } =
      await typescriptCompiler.compile(
        { path: "/getEChartsOption.ts", source: getEChartsOptionTs },
        [
          ...typeDeclarations,
          {
            path: "/LocalInstant.d.ts",
            source: LocalInstantTypeDeclaration,
          },
          {
            path: "/node_modules/echarts/index.d.ts",
            source: `
              declare module "echarts" {
                export type EChartsOption = any;
              }
            `,
          },
        ],
      );
    if (compileError) {
      if (compileError.name === "UnexpectedError") {
        throw new UnexpectedAssistantError(
          [
            `Compiling getEChartsOption failed with ${compileError.name}.`,
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
      { source: "", compiled: getEChartsOptionJs },
      [documentsByCollection],
    );

    if (!result.success) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: result,
      };
    }

    const title = result.data?.title?.text ?? result.data?.title?.[0]?.text;
    if (typeof title !== "string") {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(
          makeResultError("EChartsOptionNotValid", {
            issues: [
              { message: "Missing chart title.", path: [{ key: "title" }] },
            ],
          }),
        ),
      };
    }

    const chartId = createMarkdownElementId();
    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult({
        markdownSnippet: `<Chart id="${chartId}" />`,
        chartInfo: {
          seriesColorOrder: [
            "blue",
            "green",
            "yellow",
            "red",
            "cyan",
            "teal",
            "orange",
            "violet",
            "pink",
          ],
        },
      }),
      artifacts: { chartId, echartsOption: result.data },
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.CreateChart,
      description: `
Creates a chart that you can use in your textual responses by including verbatim
the \`markdownSnippet\` returned by the tool call.

This tool is a variant of ${ToolName.ExecuteTypescriptFunction}.

\`getEChartsOption\`:

- Takes the same parameters as the function in ${ToolName.ExecuteTypescriptFunction}
  (documents grouped by collection).
- Executes in the same environment.
- **Must** abide by ALL its rules.
- **Must** return an \`import("echarts").EChartsOption\` object.

Call this tool directly. DO NOT chain it to an ${ToolName.ExecuteTypescriptFunction}
tool call.

### Additional MANDATORY rules

- Always set a title for the chart.
- Always set:
  - \`tooltip:{trigger:"axis",axisPointer:{type:"cross"}}\`
  - \`xAxis.type = "time"\` if there are timestamps on the x axis.
  - \`grid = {left:0,right:0,top:0,bottom:0}\`
  - \`xAxis.name = undefined\`
  - \`yAxis.name = undefined\`
  - \`legend = undefined\`
- For numeric axes, narrow them to:
  - if minValue < 0 -> [minValue - 5%, maxValue + 5%] (rounded)
  - if minValue >= 0 -> [Math.max(0, minValue - 5%), maxValue + 5%] (rounded)
- In datasets and series, round all numeric values to 2 decimals. Use
  \`Math.round(value * 100)/100)\`
- For heatmaps, prefer \`visualMap.type = piecewise\`.
- Prefer column charts over line charts for discrete time series data.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionIds: {
            type: "array",
            items: { type: "string" },
          },
          getEChartsOption: {
            description:
              'TypeScript function returning an **echarts option object**. `export default function getEChartsOption(documentsByCollection: DocumentsByCollection): import("echarts").EChartsOption {}`',
            type: "string",
          },
        },
        required: ["collectionIds", "getEChartsOption"],
        additionalProperties: false,
      },
    };
  },
};
