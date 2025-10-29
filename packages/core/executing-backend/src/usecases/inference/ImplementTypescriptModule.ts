import {
  type Backend,
  type Message,
  MessageContentPartType,
  MessageRole,
  type ToolCall,
  ToolName,
  type ToolResult,
  type TooManyFailedImplementationAttempts,
  type TypescriptFile,
  type TypescriptModule,
  type UnexpectedError,
  type WriteTypescriptModuleToolNotCalled,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import InferenceService from "../../requirements/InferenceService.js";
import Usecase from "../../utils/Usecase.js";

const MAX_ATTEMPTS = 5;

export default class InferenceImplementTypescriptModule extends Usecase<
  Backend["inference"]["implementTypescriptModule"]
> {
  async exec({
    description,
    rules,
    additionalInstructions,
    template,
    libs,
    startingPoint,
    userRequest,
  }: Parameters<
    Backend["inference"]["implementTypescriptModule"]
  >[0]): ReturnType<Backend["inference"]["implementTypescriptModule"]> {
    const globalSettings = await this.repos.globalSettings.get();
    const inferenceService = this.inferenceServiceFactory.create(
      globalSettings.inference,
    );

    return this.attemptImplementation(
      inferenceService,
      description,
      rules,
      additionalInstructions,
      template,
      libs,
      startingPoint,
      userRequest,
      1,
    );
  }

  private async attemptImplementation(
    inferenceService: InferenceService,
    description: string,
    rules: string | null,
    additionalInstructions: string | null,
    template: string,
    libs: TypescriptFile[],
    startingPoint: TypescriptFile,
    userRequest: string,
    attemptNumber: number,
    previousAttempt?: Message.ToolCallAssistant | undefined,
    previousAttemptResponse?: Message.Tool | undefined,
  ): ResultPromise<
    TypescriptModule,
    | WriteTypescriptModuleToolNotCalled
    | TooManyFailedImplementationAttempts
    | UnexpectedError
  > {
    const shouldReattempt = attemptNumber < MAX_ATTEMPTS;

    const message = await inferenceService.generateNextMessage(
      [
        InferenceImplementTypescriptModule.getDeveloperMessage(
          description,
          rules,
          additionalInstructions,
          template,
          libs,
        ),
        InferenceImplementTypescriptModule.getUserContextMessage(
          startingPoint,
          userRequest,
        ),
        previousAttempt ?? null,
        previousAttemptResponse ?? null,
      ].filter((message) => message !== null),
      [WriteTypescriptModuleTool.get()],
    );

    if (
      !(
        "toolCalls" in message &&
        message.toolCalls[0] &&
        WriteTypescriptModuleTool.is(message.toolCalls[0])
      )
    ) {
      return shouldReattempt
        ? this.attemptImplementation(
            inferenceService,
            description,
            rules,
            additionalInstructions,
            template,
            libs,
            startingPoint,
            userRequest,
            attemptNumber + 1,
            previousAttempt,
            previousAttemptResponse,
          )
        : makeUnsuccessfulResult(
            makeResultError("WriteTypescriptModuleToolNotCalled", {
              generatedMessage: message,
            }),
          );
    }

    const toolCall = message.toolCalls[0];

    const compileResult = await this.typescriptCompiler.compile(
      { path: startingPoint.path, source: toolCall.input.source },
      libs,
    );

    if (!compileResult.success) {
      return compileResult.error.name === "UnexpectedError"
        ? makeUnsuccessfulResult(compileResult.error)
        : shouldReattempt
          ? this.attemptImplementation(
              inferenceService,
              description,
              rules,
              additionalInstructions,
              template,
              libs,
              startingPoint,
              userRequest,
              attemptNumber + 1,
              message,
              {
                role: MessageRole.Tool,
                toolResults: [
                  {
                    tool: ToolName.WriteTypescriptModule,
                    toolCallId: toolCall.id,
                    output: makeUnsuccessfulResult(compileResult.error),
                  } satisfies ToolResult.WriteTypescriptModule,
                ],
                createdAt: new Date(),
              },
            )
          : makeUnsuccessfulResult(
              makeResultError("TooManyFailedImplementationAttempts", {
                failedAttemptsCount: attemptNumber,
              }),
            );
    }

    return makeSuccessfulResult({
      source: toolCall.input.source.replace(
        `// filename: ${startingPoint.path}\n`,
        "",
      ),
      compiled: compileResult.data,
    });
  }

  private static getDeveloperMessage(
    description: string,
    rules: string | null,
    additionalInstructions: string | null,
    template: string,
    libs: TypescriptFile[],
  ): Message.Developer {
    const availableLibs = slimDownLibs(libs)
      .flatMap((lib) => [
        "```ts",
        `// filename: ${lib.path}`,
        lib.source,
        "```",
        "",
      ])
      .join("\n");
    return {
      role: MessageRole.Developer,
      content: [
        {
          type: MessageContentPartType.Text,
          text: `
You are a TypeScript code generator. When asked to implement code, you MUST call
${ToolName.WriteTypescriptModule}. Do not write any response text - only return
the tool call.

Starting from the user-supplied TypeScript starting point, implement the
**entire** module to satisfy the user request.

## Module description

${description}

## Implementation rules

- The module’s default export **must match exactly** the type specified in the
  template below.
- The module can import and use the TypeScript files provided below.
- The implemented module MUST compile without errors and have no type errors.
  When you receive compiler diagnostics, correct them and call the tool again.
- Solve all pending TODOs.
- Only make the changes necessary to satisfy the user request - preserve
  existing working code in the starting point.
- Use clear, descriptive variable names and add comments for complex logic.
${rules ?? ""}

${additionalInstructions ? "## Additional instructions" : ""}

${additionalInstructions ? additionalInstructions : ""}

## Module template

\`\`\`ts
${template}
\`\`\`

## Available libs

${availableLibs}
          `
            .replace(/\n{3,}/g, "\n\n")
            .trim(),
        },
      ],
    };
  }

  private static getUserContextMessage(
    startingPoint: TypescriptFile,
    userRequest: string,
  ): Message.UserContext {
    return {
      role: MessageRole.UserContext,
      content: [
        {
          type: MessageContentPartType.Text,
          text: `
## Starting point

\`\`\`ts
// filename: ${startingPoint.path}
${startingPoint.source}
\`\`\`

## User request

${userRequest}
          `.trim(),
        },
      ],
    };
  }
}

const WriteTypescriptModuleTool = {
  is(toolCall: ToolCall): toolCall is ToolCall.WriteTypescriptModule {
    return toolCall.tool === ToolName.WriteTypescriptModule;
  },

  get() {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.WriteTypescriptModule,
      description: "Returns the implemented TypeScript module to the user.",
      inputSchema: {
        type: "object",
        properties: {
          source: {
            description:
              "Source code of the entire TypeScript module that was implemented. Source only. No fences.",
            type: "string",
          },
        },
      },
    } as const;
  },
};

/** Slims down libs to avoid a huge and largely useless context. */
function slimDownLibs(libs: TypescriptFile[]): TypescriptFile[] {
  return [
    ...libs.filter(
      // Remove full definitions of well-known libraries.
      (lib) =>
        !(
          lib.path.startsWith("/node_modules/react") ||
          lib.path.startsWith("/node_modules/echarts")
        ),
    ),
    // Add shim definitions for well-known libraries.
    {
      path: "/node_modules/react/index.d.ts",
      source: [
        "// Full type definitions omitted. Use standard APIs",
        'declare module "react";',
      ].join("\n"),
    },
    {
      path: "/node_modules/echarts/index.d.ts",
      source: [
        "// Full type definitions omitted. Use standard APIs",
        'declare module "echarts";',
      ].join("\n"),
    },
  ];
}
