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
import BackendUsecase from "../../utils/BackendUsecase.js";
import { globalSettings as globalSettingsSchema } from "../../validation/domain/globalSettings.js";
import {
  globalSettingsNotValid,
  unexpectedError,
} from "../../validation/errors.js";
import looseObjectAs from "../../validation/helpers/looseObjectAs.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class GlobalSettingsUpdate extends BackendUsecase<
  Backend["globalSettings"]["update"]
> {
  argumentsSchema = v.tuple([looseObjectAs<Partial<GlobalSettings>>()]);
  resultSchema = makeResultSchema(globalSettingsSchema(), [
    globalSettingsNotValid(),
    unexpectedError(),
  ]);

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
