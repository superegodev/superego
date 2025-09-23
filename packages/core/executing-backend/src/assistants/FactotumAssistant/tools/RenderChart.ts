import {
  type Collection,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import { DateTime } from "luxon";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeResultError from "../../../makers/makeResultError.js";
import makeSuccessfulResult from "../../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../../makers/makeUnsuccessfulResult.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type JavascriptSandbox from "../../../requirements/JavascriptSandbox.js";
import type DocumentsList from "../../../usecases/documents/List.js";
import { toAssistantDocument } from "../utils/AssistantDocument.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.RenderChart {
    return toolCall.tool === ToolName.RenderChart;
  },

  async exec(
    toolCall: ToolCall.RenderChart,
    collections: Collection[],
    documentsList: DocumentsList,
    javascriptSandbox: JavascriptSandbox,
  ): Promise<ToolResult.RenderChart> {
    const { collectionId, getEchartsOption } = toolCall.input;

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

    const assistantDocuments = documents.map((document) =>
      toAssistantDocument(
        collection.latestVersion.schema,
        document,
        DateTime.local().zoneName,
      ),
    );
    const result = await javascriptSandbox.executeSyncFunction(
      { source: "", compiled: getEchartsOption },
      [assistantDocuments],
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
          makeResultError("EchartsOptionNotValid", {
            issues: [
              { message: "Missing chart title.", path: [{ key: "title" }] },
            ],
          }),
        ),
      };
    }

    const chartId = crypto.randomUUID();

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult({
        markdownSnippet: `<Chart id="${chartId}" />`,
      }),
      artifacts: { chartId, echartsOption: result.data },
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.RenderChart,
      description: `
Creates a chart that you can use in your textual responses by including the
\`markdownSnippet\` returned by the tool call.

The getEchartsOption function takes the same parameters as the function in
${ToolName.ExecuteJavascriptFunction} (all the documents in the collection),
executes in the same environment, and **must** abide by ALL its rules.

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
  - if minValue < 0 -> [minValue - 5%, maxValue + 5%]
  - if minValue >= 0 -> [Math.max(0, minValue - 5%), maxValue + 5%]
- Round numeric axes boundaries.
- In datasets and series, round all numeric values to 2 decimals. Use
  \`Math.round(value * 100)/100)\`
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
          },
          getEchartsOption: {
            description:
              "JavaScript function returning an **echarts option object**. `export default function getEchartsOption(documents) { … }`",
            type: "string",
          },
        },
        required: ["collectionId", "getEchartsOption"],
        additionalProperties: false,
      },
    };
  },
};
