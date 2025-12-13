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
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";

export default class FilesGetContent extends Usecase<
  Backend["files"]["getContent"]
> {
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
