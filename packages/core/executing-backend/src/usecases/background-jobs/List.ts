import type {
  Backend,
  LiteBackgroundJob,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import makeLiteBackgroundJob from "../../makers/makeLiteBackgroundJob.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class BackgroundJobsList extends BackendUsecase<
  Backend["backgroundJobs"]["list"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = structuralSchemas.global.result(
    v.array(structuralSchemas.backend.types.liteBackgroundJob()),
    [structuralSchemas.backend.errors.unexpectedError()],
  );

  async exec(): ResultPromise<LiteBackgroundJob[], UnexpectedError> {
    const backgroundJobs = await this.repos.backgroundJob.findAll();

    return makeSuccessfulResult(backgroundJobs.map(makeLiteBackgroundJob));
  }
}
