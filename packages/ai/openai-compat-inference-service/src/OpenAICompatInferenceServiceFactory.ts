import type { AssistantSettings } from "@superego/backend";
import type {
  InferenceService,
  InferenceServiceFactory,
} from "@superego/executing-backend";
import OpenAICompatInferenceService from "./OpenAICompatInferenceService.js";

export default class OpenAICompatInferenceServiceFactory
  implements InferenceServiceFactory
{
  create(settings: AssistantSettings): InferenceService {
    if (!settings.completions.model) {
      throw new Error("Missing Assistant Settings -> Completions -> Model.");
    }
    if (!settings.completions.provider.baseUrl) {
      throw new Error("Missing Assistant Settings -> Completions -> Base URL.");
    }
    return new OpenAICompatInferenceService(
      settings.completions.model,
      settings.completions.provider.baseUrl,
      settings.completions.provider.apiKey,
    );
  }
}
