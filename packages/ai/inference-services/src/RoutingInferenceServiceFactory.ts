import type { InferenceSettings } from "@superego/backend";
import type {
  InferenceService,
  InferenceServiceFactory,
} from "@superego/executing-backend";
import GoogleInferenceService from "./GoogleInferenceService/GoogleInferenceService.js";
import GroqInferenceService from "./GroqInferenceService/GroqInferenceService.js";
import OpenaiInferenceService from "./OpenaiInferenceService/OpenaiInferenceService.js";
import OpenRouterInferenceService from "./OpenRouterInferenceService/OpenRouterInferenceService.js";

export default class RoutingInferenceServiceFactory
  implements InferenceServiceFactory
{
  create(settings: InferenceSettings): InferenceService {
    if (settings.completions.model.startsWith("Groq_")) {
      if (!settings.providers.groq.apiKey) {
        throw new Error("Missing Groq provider API Key.");
      }
      return new GroqInferenceService(
        settings.completions.model,
        settings.providers.groq.apiKey,
      );
    }
    if (settings.completions.model.startsWith("OpenAI_")) {
      if (!settings.providers.openai.apiKey) {
        throw new Error("Missing OpenAI provider API Key.");
      }
      return new OpenaiInferenceService(
        settings.completions.model,
        settings.providers.openai.apiKey,
      );
    }
    if (settings.completions.model.startsWith("Google_")) {
      if (!settings.providers.google.apiKey) {
        throw new Error("Missing Google provider API Key.");
      }
      return new GoogleInferenceService(
        settings.completions.model,
        settings.providers.google.apiKey,
      );
    }
    if (settings.completions.model.startsWith("OpenRouter_")) {
      if (!settings.providers.openrouter.apiKey) {
        throw new Error("Missing OpenRouter provider API Key.");
      }
      return new OpenRouterInferenceService(
        settings.completions.model,
        settings.providers.openrouter.apiKey,
      );
    }
    throw new Error(`Unknown completion model ${settings.completions.model}.`);
  }
}
