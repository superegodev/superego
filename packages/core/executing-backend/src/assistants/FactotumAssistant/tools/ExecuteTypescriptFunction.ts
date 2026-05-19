import { type ToolCall, ToolName, type ToolResult } from "@superego/backend";
import LocalInstantTypeDeclaration from "@superego/javascript-sandbox-global-utils/LocalInstant.d.ts?raw";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type DocumentsExecuteTypescriptFunction from "../../../usecases/documents/ExecuteTypescriptFunction.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.ExecuteTypescriptFunction {
    return toolCall.tool === ToolName.ExecuteTypescriptFunction;
  },

  async exec(
    toolCall: ToolCall.ExecuteTypescriptFunction,
    documentsExecuteTypescriptFunction: DocumentsExecuteTypescriptFunction,
  ): Promise<ToolResult.ExecuteTypescriptFunction> {
    const output = await documentsExecuteTypescriptFunction.exec(
      toolCall.input.collectionIds,
      toolCall.input.typescriptFunction,
    );
    if (output.success) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output,
      } as ToolResult.ExecuteTypescriptFunction;
    }
    if (
      output.error.name === "CollectionNotFound" ||
      output.error.name === "TypescriptCompilationFailed" ||
      output.error.name === "ExecutingJavascriptFunctionFailed"
    ) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output,
      } as ToolResult.ExecuteTypescriptFunction;
    }
    if (output.error.name === "UnexpectedError") {
      throw new UnexpectedAssistantError(
        `Executing TypeScript function failed with ${output.error.name}. Cause: ${output.error.details.cause}`,
      );
    }
    throw new UnexpectedAssistantError("Executing TypeScript function failed.");
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.ExecuteTypescriptFunction,
      description: `
Runs a **synchronous**, **read-only** TypeScript function over **all documents**
in one or more collections; returns a JSON-safe result. Use this to **search**
for a document, **fetch** a specific item by \`id\`, or compute aggregates.

**MANDATORY**: You **must** call \`${ToolName.GetCollectionTypescriptSchema}\` for
each target collection before using this tool.

### \`typescriptFunction\` template

\`\`\`ts
// This imports the types returned from the \`${ToolName.GetCollectionTypescriptSchema}\` tool call.
// Replace Collection_abc with the full id (Collection_abc...) of each collection
// you're running the function on.
import type * as Collection_abc from "./Collection_abc.ts";
import type * as Collection_def from "./Collection_def.ts";
// ...other collections

interface Document<Content> {
  // Document ID
  id: string;
  // Current document version ID
  versionId: string;
  // The root type from the collection types. The content is guaranteed to abide
  // by the TypeScript schema.
  content: Content;
}

type DocumentsByCollection = {
  Collection_abc: Document<Collection_abc.$rootTypeName>[];
  Collection_def: Document<Collection_def.$rootTypeName>[];
  // ...other collections
};

export default function main(documentsByCollection: DocumentsByCollection): any {
  // Implementation goes here.
}
\`\`\`

### Rules

- The function **must match exactly** the template above.
- The function **must compile without errors**. When you receive compiler
  errors, correct them and call the tool again.
- No \`async\`, timers, or network.
- No \`import\` or \`require\` other than type imports.
- Return **JSON-safe** values only (convert Dates to ISO strings if returning
  them).
- Comment at least 40% of lines with brief explanations of intent,
  plus a one-sentence docstring per function.

### Working with dates and times

Always use the \`globalThis.LocalInstant\` helper for **all** date/time parsing,
math, and formatting. It runs in the user's timezone and correctly handles DST
shifts, leap years, end-of-month rollovers, and locale formatting. Prefer
\`LocalInstant\` over native \`Date\` arithmetic.

\`\`\`ts
${LocalInstantTypeDeclaration}
\`\`\`
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionIds: {
            description: "Full ids of the target collections",
            examples: [["Collection_abc", "Collection_def"]],
            type: "array",
            items: { type: "string" },
          },
          typescriptFunction: {
            description: "TypeScript source string.",
            type: "string",
          },
        },
        required: ["collectionIds", "typescriptFunction"],
        additionalProperties: false,
      },
    };
  },
};
