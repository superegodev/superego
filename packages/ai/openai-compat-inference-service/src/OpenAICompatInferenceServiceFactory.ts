import type { InferenceSettings } from "@superego/backend";
import type {
  InferenceService,
  InferenceServiceFactory,
} from "@superego/executing-backend";
import OpenAICompatInferenceService from "./OpenAICompatInferenceService.js";

// TODO_AI:
// - rename to MultiDriverInferenceServiceFactory
// - architect to support multiple drivers, though only support openrouter for
//   now
export default class OpenAICompatInferenceServiceFactory
  implements InferenceServiceFactory
{
  create(settings: InferenceSettings): InferenceService {
    return new OpenAICompatInferenceService(settings);
  }
}
