import type { AssistantSettings } from "@superego/backend";
import type InferenceService from "./InferenceService.js";

export default interface InferenceServiceFactory {
  create(settings: AssistantSettings): InferenceService;
}
