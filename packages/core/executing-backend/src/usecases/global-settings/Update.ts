import type {
  Backend,
  GlobalSettings,
  GlobalSettingsNotValid,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import Usecase from "../../utils/Usecase.js";

export default class GlobalSettingsUpdate extends Usecase<
  Backend["globalSettings"]["update"]
> {
  async exec(
    globalSettingsPatch: Partial<GlobalSettings>,
  ): ResultPromise<GlobalSettings, GlobalSettingsNotValid | UnexpectedError> {
    const globalSettings = await this.repos.globalSettings.get();
    const updatedGlobalSettings: GlobalSettings = {
      ...globalSettings,
      ...globalSettingsPatch,
    };

    const validationResult = v.safeParse(
      valibotSchemas.globalSettings(),
      updatedGlobalSettings,
    );
    if (!validationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("GlobalSettingsNotValid", {
          issues: makeValidationIssues(validationResult.issues),
        }),
      );
    }

    await this.repos.globalSettings.replace(updatedGlobalSettings);
    return makeSuccessfulResult(updatedGlobalSettings);
  }
}
