import type { Conversation, ToolResult } from "@superego/backend";

const DISPLAY_NAME_LENGTH = 16;

export default {
  getDisplayName({ title }: Conversation): string {
    const segments = [
      ...new Intl.Segmenter(undefined, { granularity: "word" }).segment(title),
    ];
    return segments.length > DISPLAY_NAME_LENGTH
      ? `${segments
          .slice(0, DISPLAY_NAME_LENGTH)
          .map(({ segment }) => segment)
          .join("")}…`
      : title;
  },

  isSuccessfulCreateDocumentForCollectionToolResult(
    toolResult: ToolResult,
  ): toolResult is ToolResult.CreateDocumentForCollection & {
    output: { success: true };
  } {
    return toolResult.tool.endsWith(".createDocument");
  },
};
