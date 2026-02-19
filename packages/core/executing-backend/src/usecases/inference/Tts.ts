import type { AudioContent, Backend, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class InferenceTts extends Usecase<Backend["inference"]["tts"]> {
  @validateArgs([v.string()])
  async exec(text: string): ResultPromise<AudioContent, UnexpectedError> {
    const globalSettings = await this.repos.globalSettings.get();
    const inferenceService = this.inferenceServiceFactory.create(
      globalSettings.inference,
    );
    const audio = await inferenceService.tts(text);
    return makeSuccessfulResult(audio);
  }
}
