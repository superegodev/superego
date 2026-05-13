import type {
  Backend,
  LiteBackgroundJob,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import makeLiteBackgroundJob from "../../makers/makeLiteBackgroundJob.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import { liteBackgroundJob } from "../../validation/domain/backgroundJob.js";
import { unexpectedError } from "../../validation/errors.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class BackgroundJobsList extends BackendUsecase<
  Backend["backgroundJobs"]["list"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = makeResultSchema(v.array(liteBackgroundJob()), [
    unexpectedError(),
  ]);

  async exec(): ResultPromise<LiteBackgroundJob[], UnexpectedError> {
    const backgroundJobs = await this.repos.backgroundJob.findAll();

    return makeSuccessfulResult(backgroundJobs.map(makeLiteBackgroundJob));
  }
}
