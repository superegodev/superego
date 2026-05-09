import { backendContracts, type UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import Usecase from "../../utils/Usecase.js";

export default class DatabaseExport extends Usecase<
  typeof backendContracts.database.export
> {
  async exec(path: string): ResultPromise<null, UnexpectedError> {
    await this.repos.export(path);
    return makeSuccessfulResult(null);
  }
}
