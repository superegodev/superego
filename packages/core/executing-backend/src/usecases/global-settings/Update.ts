import type {
  Backend,
  GlobalSettings,
  RpcResultPromise,
} from "@superego/backend";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import Usecase from "../../utils/Usecase.js";

export default class GlobalSettingsUpdate extends Usecase<
  Backend["globalSettings"]["update"]
> {
  async exec(
    globalSettingsPatch: Partial<GlobalSettings>,
  ): RpcResultPromise<GlobalSettings> {
    const globalSettings = await this.repos.globalSettings.get();
    const updatedGlobalSettings: GlobalSettings = {
      ...globalSettings,
      ...globalSettingsPatch,
    };
    this.repos.globalSettings.replace(updatedGlobalSettings);
    return makeSuccessfulRpcResult(updatedGlobalSettings);
  }
}
