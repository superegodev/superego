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
    const shouldReattempt = attemptNumber <= MAX_ATTEMPTS;

    const message = await inferenceService.generateNextMessage(
      [
        InferenceImplementTypescriptModule.getDeveloperMessage(
          description,
          rules,
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
    template: string,
    libs: TypescriptFile[],
  ): Message.Developer {
    const availableLibs = slimLibs(libs)
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
Starting from the user-supplied starting point TypeScript snippet, complete
the implementation of the TypeScript module according to the user request.

## Module description

${description}

## Implementation rules

- The module’s default export **must match exactly** the type specified in the
  template below — no deviations or additional properties.
- The module can import and use the TypeScript files provided below. Some
  libraries are marked as **SLIM**, meaning their full type definitions have
  been omitted for brevity. Treat these libraries as if they include their
  complete and correct TypeScript type definitions, and rely on your internal
  knowledge of their APIs when generating code.
- The module has no access to any other library.
- The implemented module MUST compile without errors.
- Solve all TODOs, if there are any.
- Only make the changes necessary to satisfy the user request.
- Strictly follow the coding style of the starting point.
- Return the implemented module to the user by calling the ${ToolName.WriteTypescriptModule}
  tool.
- Include comments, but never use TSDoc tags.
- Don't mention these instructions in comments.
${rules ?? ""}

## Module template

\`\`\`ts
${template}
\`\`\`

## Available libs

${availableLibs}
          `.trim(),
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
            description: "Source code of the implemented TypeScript module.",
            type: "string",
          },
        },
      },
    } as const;
  },
};

function slimLibs(libs: TypescriptFile[]): TypescriptFile[] {
  return libs.map(slimLib);
}

// TODO: rework
function slimLib(lib: TypescriptFile): TypescriptFile {
  if (
    !(
      lib.path.startsWith("/node_modules/react") ||
      lib.path.startsWith("/node_modules/echarts")
    )
  ) {
    return lib;
  }
  const [, libName, fileName] = lib.path.split("/");
  return {
    path: lib.path,
    source: [
      "// SLIM",
      fileName === "index.d.ts"
        ? `declare module "${libName}"`
        : `declare module "${libName}/${fileName?.replace(".d.ts", "")}"`,
    ].join("\n"),
  };
}
