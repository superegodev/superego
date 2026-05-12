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
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";
import {
  inferenceOptionsNotValid,
  unexpectedError,
} from "../../validation/errors.js";
import looseObjectAs from "../../validation/helpers/looseObjectAs.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class InferenceStt extends Usecase<Backend["inference"]["stt"]> {
  argumentsSchema = v.tuple([
    looseObjectAs<AudioContent>(),
    looseObjectAs<InferenceOptions<"transcription">>(),
  ]);
  resultSchema = makeResultSchema(v.string(), [
    inferenceOptionsNotValid(),
    unexpectedError(),
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
