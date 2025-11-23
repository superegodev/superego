import {
  type FileId,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import InferenceService from "../../requirements/InferenceService.js";
import type FilesGetContent from "../../usecases/files/GetContent.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.InspectFile {
    return toolCall.tool === ToolName.InspectFile;
  },

  async exec(
    toolCall: ToolCall.InspectFile,
    inferenceService: InferenceService,
    filesGetContent: FilesGetContent,
  ): Promise<ToolResult.InspectFile> {
    const { file, prompt } = toolCall.input;

    const {
      success,
      data: content,
      error,
    } = await filesGetContent.exec(file.id as FileId);

    if (error && error.name === "UnexpectedError") {
      throw new UnexpectedAssistantError(
        `Getting file content failed with UnexpectedError. Cause: ${error.details.cause}`,
      );
    }

    if (!success) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(error),
      };
    }

    const fileInfo = await inferenceService.inspectFile(
      { name: file.name, mimeType: file.mimeType, content: content },
      prompt,
    );

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult({ fileInfo }),
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.InspectFile,
      description: `
Delegates the analysis of a file (Image, Video, or PDF) to a specialized
multimodal model.

You don't have direct access to files referenced in a user message or in a
document content. Use this tool when you need to inspect those files. You act as
the orchestrator, asking the specialized model to extract specific visual or
textual information needed to continue the conversation.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          file: {
            description:
              "The exact file object referenced in a user's message or contained in a document.",
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              mimeType: { type: "string" },
            },
            required: ["id", "name", "mimeType"],
            additionalProperties: false,
          },
          prompt: {
            description: `
The specific question or instruction for the specialized model. CRITICAL: The
specialized model DOES NOT see the chat history. It only sees the file and this
prompt. Therefore, your prompt must explicitly include any necessary context.
            `.trim(),
            type: "string",
          },
        },
        required: ["file", "prompt"],
        additionalProperties: false,
      },
    };
  },
};
