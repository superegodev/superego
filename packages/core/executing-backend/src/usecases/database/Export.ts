import type { Backend, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class DatabaseExport extends BackendUsecase<
  Backend["database"]["export"]
> {
  argumentsSchema = v.tuple([v.string()]);
  resultSchema = structuralSchemas.global.result(v.null(), [
    structuralSchemas.backend.errors.unexpectedError(),
  ]);

  async exec(path: string): ResultPromise<null, UnexpectedError> {
    await this.repos.export(path);
    return makeSuccessfulResult(null);
  }
}
