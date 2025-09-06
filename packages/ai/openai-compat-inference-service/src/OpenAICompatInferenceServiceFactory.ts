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
    // EVOLUTION: add other drivers, with a setting to choose which one to use.
    return new OpenAICompatInferenceService(settings);
  }
}
