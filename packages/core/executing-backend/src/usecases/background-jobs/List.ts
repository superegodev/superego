import type {
  Backend,
  LiteBackgroundJob,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import makeLiteBackgroundJob from "../../makers/makeLiteBackgroundJob.js";
import Usecase from "../../utils/Usecase.js";

export default class BackgroundJobsList extends Usecase<
  Backend["backgroundJobs"]["list"]
> {
  async exec(): ResultPromise<LiteBackgroundJob[], UnexpectedError> {
    const backgroundJobs = await this.repos.backgroundJob.findAll();

    return makeSuccessfulResult(backgroundJobs.map(makeLiteBackgroundJob));
  }
}
