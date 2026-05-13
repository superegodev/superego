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
import * as v from "valibot";
import makeBackgroundJob from "../../makers/makeBackgroundJob.js";
import makeResultError from "../../makers/makeResultError.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import { backgroundJob } from "../../validation/domain/backgroundJob.js";
import {
  backgroundJobNotFound,
  unexpectedError,
} from "../../validation/errors.js";
import { backgroundJobId } from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class BackgroundJobsGet extends BackendUsecase<
  Backend["backgroundJobs"]["get"]
> {
  argumentsSchema = v.tuple([backgroundJobId()]);
  resultSchema = makeResultSchema(backgroundJob(), [
    backgroundJobNotFound(),
    unexpectedError(),
  ]);

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
