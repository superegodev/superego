import type { AudioContent, Backend, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import Usecase from "../../utils/Usecase.js";

export default class AssistantsTts extends Usecase<
  Backend["assistants"]["tts"]
> {
  async exec(text: string): ResultPromise<AudioContent, UnexpectedError> {
    const globalSettings = await this.repos.globalSettings.get();
    const inferenceService = this.inferenceServiceFactory.create(
      globalSettings.inference,
    );
    const audio = await inferenceService.tts(text);
    return makeSuccessfulResult(audio);
  }
}
