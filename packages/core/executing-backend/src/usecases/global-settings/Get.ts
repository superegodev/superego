import type {
  Backend,
  GlobalSettings,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import Usecase from "../../utils/Usecase.js";

export default class GlobalSettingsGet extends Usecase<
  Backend["globalSettings"]["get"]
> {
  async exec(): ResultPromise<GlobalSettings, UnexpectedError> {
    const globalSettings = await this.repos.globalSettings.get();
    return makeSuccessfulResult(globalSettings);
  }
}
