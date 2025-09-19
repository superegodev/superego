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

    if (typeof result.data?.title?.text !== "string") {
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
      output: makeSuccessfulResult(null),
      artifacts: { echartsOption: result.data },
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.RenderChart,
      description: `
Renders a chart in the app UI for the user. Use this tool to enhance your
answers with graphical elements.

This tool is very similar to ${ToolName.ExecuteJavascriptFunction}, but instead
of executing a generic JavaScript function, it executes a
function—getEchartsOption—that must return an **echarts option object**.

The app runs that function and renders the chart.

On a successful response to the call, the chart has ALREADY been rendered to the
user. Never attempt to link it in your textual follow-up response.

The function takes the same parameters as the function in
${ToolName.ExecuteJavascriptFunction} (all the documents in the collection),
executes in the same environment, and **must** abide by the same rules.

Additional rules:
- A title for the chart **must** always be set.
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
