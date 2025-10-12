import type {
  Backend,
  BackgroundJob,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import makeBackgroundJob from "../../makers/makeBackgroundJob.js";
import Usecase from "../../utils/Usecase.js";

export default class BackgroundJobsList extends Usecase<
  Backend["backgroundJobs"]["list"]
> {
  async exec(): ResultPromise<BackgroundJob[], UnexpectedError> {
    const backgroundJobs = await this.repos.backgroundJob.findAll();

    return makeSuccessfulResult(backgroundJobs.map(makeBackgroundJob));
  }
}
