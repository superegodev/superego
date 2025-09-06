import type { InferenceSettings } from "@superego/backend";
import type InferenceService from "./InferenceService.js";

export default interface InferenceServiceFactory {
  create(settings: InferenceSettings): InferenceService;
}
