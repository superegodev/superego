import type { AssistantSettings } from "@superego/backend";
import type { Assistant, AssistantManager } from "@superego/executing-backend";
import GroqAssistant from "./GroqAssistant.js";

export default class RoutingAssistantManager implements AssistantManager {
  getAssistant(settings: AssistantSettings): Assistant {
    if (settings.providers.groq.apiKey) {
      return new GroqAssistant(
        settings.completions.defaultModel,
        settings.providers.groq.apiKey,
        settings.providers.groq.baseUrl,
      );
    }
    throw new Error("No assistant is configured.");
  }
}
