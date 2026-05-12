import type { Backend, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import Usecase from "../../utils/Usecase.js";
import { unexpectedError } from "../../validation/errors.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class DatabaseExport extends Usecase<
  Backend["database"]["export"]
> {
  argumentsSchema = v.tuple([v.string()]);
  resultSchema = makeResultSchema(v.null(), [unexpectedError()]);

  async exec(path: string): ResultPromise<null, UnexpectedError> {
    await this.repos.export(path);
    return makeSuccessfulResult(null);
  }
}
