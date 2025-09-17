import type { ToolCall, ToolResult } from "@superego/backend";
import { DateTime } from "luxon";
import type InferenceService from "../../requirements/InferenceService.js";
import Assistant from "../Assistant.js";
import defaultDeveloperPrompt from "./default-developer-prompt.md?raw";
import Unknown from "./tools/Unknown.js";

export default class CollectionCreatorAssistant extends Assistant {
  constructor(
    private developerPrompt: string | null,
    protected inferenceService: InferenceService,
  ) {
    super();
  }

  static getDefaultDeveloperPrompt(): string {
    return defaultDeveloperPrompt;
  }

  protected getDeveloperPrompt(): string {
    return this.developerPrompt ?? defaultDeveloperPrompt;
  }

  protected getUserContextPrompt(): string {
    const now = DateTime.now();
    return [
      "<local-date-time>",
      now.toISO({
        precision: "millisecond",
        includeOffset: true,
        extendedZone: true,
      }),
      "</local-date-time>",
      "<weekday>",
      now.toFormat("cccc"),
      "<weekday>",
    ].join("\n");
  }

  protected getTools(): InferenceService.Tool[] {
    return [];
  }

  protected async processToolCall(toolCall: ToolCall): Promise<ToolResult> {
    return Unknown.exec(toolCall);
  }
}
