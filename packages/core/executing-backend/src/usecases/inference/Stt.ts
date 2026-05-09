import {
  type AudioContent,
  backendContracts,
  type InferenceOptionsNotValid,
  type InferenceOptionsTranscription,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  validateInferenceOptions,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";

export default class InferenceStt extends Usecase<
  typeof backendContracts.inference.stt
> {
  async exec(
    audio: AudioContent,
    inferenceOptions: InferenceOptionsTranscription,
  ): ResultPromise<string, InferenceOptionsNotValid | UnexpectedError> {
    const globalSettings = await this.repos.globalSettings.get();

    const inferenceOptionsIssues = validateInferenceOptions(
      inferenceOptions,
      globalSettings.inference,
    );
    if (!isEmpty(inferenceOptionsIssues)) {
      return makeUnsuccessfulResult(
        makeResultError("InferenceOptionsNotValid", {
          issues: inferenceOptionsIssues,
        }),
      );
    }

    const inferenceService = this.inferenceServiceFactory.create(
      globalSettings.inference,
    );
    const text = await inferenceService.stt(audio, inferenceOptions);
    return makeSuccessfulResult(text);
  }
}
