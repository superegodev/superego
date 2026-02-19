import type {
  Backend,
  GlobalSettings,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import * as argSchemas from "../../utils/argSchemas.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class GlobalSettingsUpdate extends Usecase<
  Backend["globalSettings"]["update"]
> {
  @validateArgs([
    v.partial(
      argSchemas.globalSettings() as unknown as v.StrictObjectSchema<
        v.ObjectEntries,
        undefined
      >,
    ) as unknown as v.GenericSchema<Partial<GlobalSettings>>,
  ])
  async exec(
    globalSettingsPatch: Partial<GlobalSettings>,
  ): ResultPromise<GlobalSettings, UnexpectedError> {
    const globalSettings = await this.repos.globalSettings.get();
    const updatedGlobalSettings: GlobalSettings = {
      ...globalSettings,
      ...globalSettingsPatch,
    };
    await this.repos.globalSettings.replace(updatedGlobalSettings);
    return makeSuccessfulResult(updatedGlobalSettings);
  }
}
