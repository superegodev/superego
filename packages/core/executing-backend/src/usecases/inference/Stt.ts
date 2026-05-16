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
  validateInferenceOptions,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import isEmpty from "../../utils/isEmpty.js";

export default class InferenceStt extends BackendUsecase<
  Backend["inference"]["stt"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.types.audioContent(),
    structuralSchemas.backend.types.inferenceOptions("transcription"),
  ]);
  resultSchema = structuralSchemas.global.result(v.string(), [
    structuralSchemas.backend.errors.inferenceOptionsNotValid(),
    structuralSchemas.backend.errors.unexpectedError(),
  ]);

  async exec(
    audio: AudioContent,
    inferenceOptions: InferenceOptions<"transcription">,
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
