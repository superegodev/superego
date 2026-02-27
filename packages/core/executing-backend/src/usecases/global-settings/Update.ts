import type {
  Backend,
  GlobalSettings,
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

export default class GlobalSettingsUpdate extends Usecase<
  Backend["globalSettings"]["update"]
> {
  async exec(
    globalSettingsPatch: Partial<GlobalSettings>,
  ): ResultPromise<GlobalSettings, InferenceOptionsNotValid | UnexpectedError> {
    const globalSettings = await this.repos.globalSettings.get();
    const updatedGlobalSettings: GlobalSettings = {
      ...globalSettings,
      ...globalSettingsPatch,
    };

    const inferenceOptionsNotValid = validateInferenceOptions(
      updatedGlobalSettings.inference.defaultInferenceOptions,
      updatedGlobalSettings.inference,
    );
    if (inferenceOptionsNotValid) {
      return makeUnsuccessfulResult(inferenceOptionsNotValid);
    }

    await this.repos.globalSettings.replace(updatedGlobalSettings);
    return makeSuccessfulResult(updatedGlobalSettings);
  }
}
