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
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class FilesGetContent extends BackendUsecase<
  Backend["files"]["getContent"]
> {
  argumentsSchema = v.tuple([structuralSchemas.backend.ids.fileId()]);
  resultSchema = structuralSchemas.global.result(
    v.instance(Uint8Array) as v.GenericSchema<unknown, Uint8Array<ArrayBuffer>>,
    [
      structuralSchemas.backend.errors.fileNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
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
