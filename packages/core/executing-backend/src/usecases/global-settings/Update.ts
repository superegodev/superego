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
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class GlobalSettingsUpdate extends BackendUsecase<
  Backend["globalSettings"]["update"]
> {
  // Structural-only: the patch is merged with the stored settings and the
  // result is fully validated by `valibotSchemas.globalSettings()` in `exec`,
  // which surfaces `GlobalSettingsNotValid`.
  argumentsSchema = v.tuple([
    v.strictObject({
      appearance: v.optional(v.looseObject({})),
      inference: v.optional(v.looseObject({})),
      assistants: v.optional(v.looseObject({})),
    }) as unknown as v.GenericSchema<unknown, Partial<GlobalSettings>>,
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.globalSettings(),
    [
      structuralSchemas.backend.errors.globalSettingsNotValid(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

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
