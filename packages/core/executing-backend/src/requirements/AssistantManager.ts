import type { AssistantSettings } from "@superego/backend";
import type Assistant from "./Assistant.js";

export default interface AssistantManager {
  getAssistant(settings: AssistantSettings): Assistant;
}
