import type {
  AudioContent,
  Backend,
  InferenceOptions,
  InferenceOptionsNotValid,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import Usecase from "../../utils/Usecase.js";
import validateInferenceOptions from "../../validators/validateInferenceOptions.js";

export default class InferenceStt extends Usecase<Backend["inference"]["stt"]> {
  async exec(
    audio: AudioContent,
    inferenceOptions: InferenceOptions<"transcription">,
  ): ResultPromise<string, InferenceOptionsNotValid | UnexpectedError> {
    const globalSettings = await this.repos.globalSettings.get();

    const inferenceOptionsNotValid = validateInferenceOptions(
      inferenceOptions,
      globalSettings.inference,
    );
    if (inferenceOptionsNotValid) {
      return makeUnsuccessfulResult(inferenceOptionsNotValid);
    }

    const inferenceService = this.inferenceServiceFactory.create(
      globalSettings.inference,
    );
    const text = await inferenceService.stt(audio, inferenceOptions);
    return makeSuccessfulResult(text);
  }
}
