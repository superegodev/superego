import type {
  Backend,
  GlobalSettings,
  RpcResultPromise,
} from "@superego/backend";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import Usecase from "../../utils/Usecase.js";

export default class GlobalSettingsGet extends Usecase<
  Backend["globalSettings"]["get"]
> {
  async exec(): RpcResultPromise<GlobalSettings> {
    const globalSettings = await this.repos.globalSettings.get();
    return makeSuccessfulRpcResult(globalSettings);
  }
}
