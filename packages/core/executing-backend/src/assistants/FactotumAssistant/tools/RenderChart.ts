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
      await documentsList.exec(collectionId);
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

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult(
        "The chart has been successfully rendered. The user can now see it.",
      ),
      artifacts: { echartsOption: result.data },
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.RenderChart,
      description: `
Renders a chart in the app UI. Use this tool to enhance your answers with
graphical elements.

The getEchartsOption function takes the same parameters as the function in
${ToolName.ExecuteJavascriptFunction} (all the documents in the collection),
executes in the same environment, and **must** abide by the same rules.

Additional mandatory rules:
- Never link the chart it in your textual follow-up response.
- Always set a title for the chart.
- Strongly prefer:
  - \`tooltip:{trigger:"axis",axisPointer:{type:"cross"}}\`
  - \`xAxis.type = "time"\` if there are timestamps on the x axis.
  - \`grid = {left:0,right:0,top:0,bottom:0}\`
  - \`xAxis.name = undefined\`
  - \`yAxis.name = undefined\`
  - \`legend = undefined\`.
- For numeric axes:
  - Narrow the axis to [minValue - 5%, maxValue + 5%].
  - Format labels dynamically: pick a consistent unit (k, M, B) based on value
    magnitude; divide all ticks by that unit; append the suffix; show ≤2
    decimals, strip trailing zeros. Apply same formatting to axis labels,
    tooltips, and axisPointer.
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
