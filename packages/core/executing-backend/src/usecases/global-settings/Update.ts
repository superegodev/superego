import type {
  Backend,
  GlobalSettings,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import Usecase from "../../utils/Usecase.js";

export default class GlobalSettingsUpdate extends Usecase<
  Backend["globalSettings"]["update"]
> {
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
