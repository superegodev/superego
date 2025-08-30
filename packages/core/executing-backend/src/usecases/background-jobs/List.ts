import type {
  Backend,
  BackgroundJob,
  RpcResultPromise,
} from "@superego/backend";
import makeBackgroundJob from "../../makers/makeBackgroundJob.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import Usecase from "../../utils/Usecase.js";

export default class BackgroundJobsList extends Usecase<
  Backend["backgroundJobs"]["list"]
> {
  async exec(): RpcResultPromise<BackgroundJob[]> {
    const backgroundJobs = await this.repos.backgroundJob.findAll();

    return makeSuccessfulRpcResult(backgroundJobs.map(makeBackgroundJob));
  }
}
