import type { Backend, Pack, PackId, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeUnsuccessfulResult } from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";

export default class BazaarGetPack extends Usecase<
  Backend["bazaar"]["getPack"]
> {
  async exec(_id: PackId): ResultPromise<Pack, UnexpectedError> {
    // TODO: Implement actual pack fetching from bazaar service
    return makeUnsuccessfulResult(
      makeResultError("UnexpectedError", {
        cause: { message: "Not implemented" },
      }),
    );
  }
}
