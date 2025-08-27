import type { AssistantSettings } from "@superego/backend";
import type {
  InferenceService,
  InferenceServiceFactory,
} from "@superego/executing-backend";
import GroqInferenceService from "./GroqInferenceService/GroqInferenceService.js";

export default class RoutingInferenceServiceFactory
  implements InferenceServiceFactory
{
  create(settings: AssistantSettings): InferenceService {
    if (settings.providers.groq.apiKey) {
      return new GroqInferenceService(
        settings.completions.defaultModel,
        settings.providers.groq.apiKey,
        settings.providers.groq.baseUrl,
      );
    }
    throw new Error("No configuration found for any InferenceService.");
  }
}
