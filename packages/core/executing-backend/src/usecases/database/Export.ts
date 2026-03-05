import type { Backend, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import Usecase from "../../utils/Usecase.js";

export default class DatabaseExport extends Usecase<
  Backend["database"]["export"]
> {
  async exec(path: string): ResultPromise<null, UnexpectedError> {
    await this.repos.export(path);
    return makeSuccessfulResult(null);
  }
}
