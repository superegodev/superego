import type { InferenceSettings } from "@superego/backend";
import type {
  InferenceService,
  InferenceServiceFactory,
} from "@superego/executing-backend";
import OpenAICompatInferenceService from "./OpenAICompatInferenceService.js";

export default class OpenAICompatInferenceServiceFactory
  implements InferenceServiceFactory
{
  create(settings: InferenceSettings): InferenceService {
    if (!settings.completions.model) {
      throw new Error("Missing Settings -> Inference -> Completions -> Model.");
    }
    if (!settings.completions.provider.baseUrl) {
      throw new Error(
        "Missing Settings -> Inference -> Completions -> Base URL.",
      );
    }
    // EVOLUTION: add other "drivers", with a setting to choose which one to use.
    return new OpenAICompatInferenceService(
      settings.completions.model,
      settings.completions.provider.baseUrl,
      settings.completions.provider.apiKey,
    );
  }
}
