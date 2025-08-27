import type { AssistantSettings } from "@superego/backend";
import type InferenceService from "./InferenceService.js";

export default interface InferenceServiceFactory {
  // TODO: rename assistant settings
  create(settings: AssistantSettings): InferenceService;
}
