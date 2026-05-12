import type {
  Backend,
  FileId,
  FileNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";
import { fileNotFound, unexpectedError } from "../../validation/errors.js";
import { fileId } from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class FilesGetContent extends Usecase<
  Backend["files"]["getContent"]
> {
  argumentsSchema = v.tuple([fileId()]);
  resultSchema = makeResultSchema(
    v.instance(Uint8Array) as v.GenericSchema<unknown, Uint8Array<ArrayBuffer>>,
    [fileNotFound(), unexpectedError()],
  );

  async exec(
    id: FileId,
  ): ResultPromise<Uint8Array<ArrayBuffer>, FileNotFound | UnexpectedError> {
    const content = await this.repos.file.getContent(id);
    if (!content) {
      return makeUnsuccessfulResult(
        makeResultError("FileNotFound", { fileId: id }),
      );
    }

    return makeSuccessfulResult(content);
  }
}
