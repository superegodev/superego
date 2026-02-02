import type {
  Backend,
  BackgroundJob,
  BackgroundJobId,
  BackgroundJobNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeBackgroundJob from "../../makers/makeBackgroundJob.js";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";

export default class BackgroundJobsGet extends Usecase<
  Backend["backgroundJobs"]["get"]
> {
  async exec(
    id: BackgroundJobId,
  ): ResultPromise<BackgroundJob, BackgroundJobNotFound | UnexpectedError> {
    const backgroundJob = await this.repos.backgroundJob.find(id);
    if (!backgroundJob) {
      return makeUnsuccessfulResult(
        makeResultError("BackgroundJobNotFound", { backgroundJobId: id }),
      );
    }

    return makeSuccessfulResult(makeBackgroundJob(backgroundJob));
  }
}
