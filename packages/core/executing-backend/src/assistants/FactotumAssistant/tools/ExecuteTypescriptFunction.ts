import {
  type Collection,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import LocalInstantTypeDeclaration from "@superego/javascript-sandbox-global-utils/LocalInstant.d.ts?raw";
import { codegen } from "@superego/schema";
import { makeUnsuccessfulResult } from "@superego/shared-utils";
import { DateTime } from "luxon";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeResultError from "../../../makers/makeResultError.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type JavascriptSandbox from "../../../requirements/JavascriptSandbox.js";
import type TypescriptCompiler from "../../../requirements/TypescriptCompiler.js";
import type DocumentsList from "../../../usecases/documents/List.js";
import { toAssistantDocument } from "../utils/AssistantDocument.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.ExecuteTypescriptFunction {
    return toolCall.tool === ToolName.ExecuteTypescriptFunction;
  },

  async exec(
    toolCall: ToolCall.ExecuteTypescriptFunction,
    collections: Collection[],
    documentsList: DocumentsList,
    javascriptSandbox: JavascriptSandbox,
    typescriptCompiler: TypescriptCompiler,
  ): Promise<ToolResult.ExecuteTypescriptFunction> {
    const { collectionId, typescriptFunction } = toolCall.input;

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

    const { data: javascriptFunction, error: compileError } =
      await typescriptCompiler.compile(
        { path: "/main.ts", source: typescriptFunction },
        [
          {
            path: `/${collection.id}.ts`,
            source: codegen(collection.latestVersion.schema),
          },
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
            `Compiling typescriptFunction failed with ${compileError.name}.`,
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
      { source: "", compiled: javascriptFunction },
      [assistantDocuments],
    );

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: result,
    } as ToolResult.ExecuteTypescriptFunction;
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.ExecuteTypescriptFunction,
      description: `
Runs a **synchronous**, **read-only** TypeScript function over **all documents**
in one specific collection; returns a JSON-safe result. Use this to **search**
for a document (e.g., by weighed criteria), **fetch** a specific item by \`id\`,
or compute aggregates.

### \`typescriptFunction\` template

\`\`\`ts
// This imports the types returned from the ${ToolName.GetCollectionTypescriptSchema} tool call.
// Replace $collectionId with the full id (Collection_xyz...) of the collection
// you're running the function on.
import type * as $collectionId from "./$collectionId.ts";

interface Document {
  // Document ID
  id: string;
  // Current document version ID
  versionId: string;
  // The root type from the collection types. The content is guaranteed to abide
  // by the TypeScript schema.
  content: $collectionId.$rootType;
}

export default function main(documents: Document[]) {
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
          collectionId: {
            description: "Full id of the target collection",
            examples: ["Collection_xyz"],
            type: "string",
          },
          typescriptFunction: {
            description: "TypeScript source string.",
            type: "string",
          },
        },
        required: ["collectionId", "typescriptFunction"],
        additionalProperties: false,
      },
    };
  },
};
