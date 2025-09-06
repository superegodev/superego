import type { ToolCall, ToolResult } from "@superego/backend";
import { DateTime } from "luxon";
import type InferenceService from "../../requirements/InferenceService.js";
import Assistant from "../Assistant.js";
import developerPrompt from "./developer-prompt.md?raw";
import Unknown from "./tools/Unknown.js";

export default class CollectionManagerAssistant extends Assistant {
  constructor(protected inferenceService: InferenceService) {
    super();
  }

  protected getDeveloperPrompt(): string {
    return developerPrompt;
  }
  protected getUserContextPrompt(): string {
    return [
      "<local-current-date-time>",
      DateTime.now().toFormat("cccc LLLL d yyyy HH:mm:ss.SSS 'GMT'ZZZ"),
      "</local-current-date-time>",
      "",
      "<time-zone>",
      DateTime.local().zone.name,
      "</time-zone>",
    ].join("\n");
  }

  protected getTools(): InferenceService.Tool[] {
    return [];
  }

  protected async processToolCall(toolCall: ToolCall): Promise<ToolResult> {
    return Unknown.exec(toolCall);
  }
}
