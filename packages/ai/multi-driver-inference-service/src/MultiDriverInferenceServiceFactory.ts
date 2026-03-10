import type { InferenceSettings } from "@superego/backend";
import type {
  InferenceService,
  InferenceServiceFactory,
} from "@superego/executing-backend";
import MultiDriverInferenceService from "./MultiDriverInferenceService.js";

export default class MultiDriverInferenceServiceFactory
  implements InferenceServiceFactory
{
  create(settings: InferenceSettings): InferenceService {
    return new MultiDriverInferenceService(settings);
  }
}
