import {
  type Backend,
  MessageContentPartType,
  MessageRole,
  type ToolCall,
  ToolName,
  type TypescriptLib,
  type UnexpectedError,
  type WriteTypescriptFunctionToolNotCalled,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import InferenceService from "../../requirements/InferenceService.js";
import Usecase from "../../utils/Usecase.js";

export default class AssistantsImplementTypescriptFunction extends Usecase<
  Backend["assistants"]["implementTypescriptFunction"]
> {
  async exec(
    instructions: string,
    template: string,
    libs: TypescriptLib[],
    startingPoint: string,
  ): ResultPromise<
    string,
    WriteTypescriptFunctionToolNotCalled | UnexpectedError
  > {
    const globalSettings = await this.repos.globalSettings.get();
    const inferenceService = this.inferenceServiceFactory.create(
      globalSettings.inference,
    );
    const message = await inferenceService.generateNextMessage(
      [
        {
          role: MessageRole.Developer,
          content: [
            {
              type: MessageContentPartType.Text,
              text: `
Starting from the supplied <starting-point> TypeScript snippet, follow
<instructions> to complete the implementation of the TypeScript function.

### Rules

- The function should match the supplied <template>.
- The function has access and can import the TypeScript files supplied in
  <libs>.
- The implemented function MUST compile without errors.
- Only make the changes necessary to complete the implementation.
- Keep the same style of <starting-point>.
- Return the implemented function to the user by calling the
  ${ToolName.WriteTypescriptFunction} tool.
              `.trim(),
            },
          ],
        },
        {
          role: MessageRole.UserContext,
          content: [
            {
              type: MessageContentPartType.Text,
              text: [
                "<instructions>",
                instructions,
                "</instructions>",
                "<template>",
                template,
                "</template>",
                "<libs>",
                ...libs.flatMap(({ path, source }) => [
                  `<lib path=".${path}" language="typescript">`,
                  source,
                  "</lib>",
                ]),
                "</libs>",
                '<starting-point path="/main.ts" language="typescript">',
                startingPoint,
                "</starting-point>",
              ].join("\n"),
            },
          ],
        },
      ],
      [
        {
          type: InferenceService.ToolType.Function,
          name: ToolName.WriteTypescriptFunction,
          description:
            "Returns the implemented TypeScript function to the user.",
          inputSchema: {
            type: "object",
            properties: {
              source: {
                description:
                  "Source code of the implemented TypeScript function.",
                type: "string",
              },
            },
          },
        },
      ],
    );

    if (
      !(
        "toolCalls" in message &&
        message.toolCalls[0] &&
        message.toolCalls[0].tool === ToolName.WriteTypescriptFunction
      )
    ) {
      return makeUnsuccessfulResult(
        makeResultError("WriteTypescriptFunctionToolNotCalled", {
          generatedMessage: message,
        }),
      );
    }

    const toolCall = message.toolCalls[0] as ToolCall.WriteTypescriptFunction;

    return makeSuccessfulResult(toolCall.input.source);
  }
}
