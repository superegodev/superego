import type { AudioContent, Backend, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as argSchemas from "../../utils/argSchemas.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class InferenceStt extends Usecase<Backend["inference"]["stt"]> {
  @validateArgs([argSchemas.audioContent()])
  async exec(audio: AudioContent): ResultPromise<string, UnexpectedError> {
    const globalSettings = await this.repos.globalSettings.get();
    const inferenceService = this.inferenceServiceFactory.create(
      globalSettings.inference,
    );
    const text = await inferenceService.stt(audio);
    return makeSuccessfulResult(text);
  }
}
