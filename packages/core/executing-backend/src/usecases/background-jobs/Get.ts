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
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class BackgroundJobsGet extends BackendUsecase<
  Backend["backgroundJobs"]["get"]
> {
  argumentsSchema = v.tuple([structuralSchemas.backend.ids.backgroundJobId()]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.backgroundJob(),
    [
      structuralSchemas.backend.errors.backgroundJobNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

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
