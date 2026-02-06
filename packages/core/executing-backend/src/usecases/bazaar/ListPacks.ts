import type { Backend, LitePack, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import Usecase from "../../utils/Usecase.js";

export default class BazaarListPacks extends Usecase<
  Backend["bazaar"]["listPacks"]
> {
  async exec(): ResultPromise<LitePack[], UnexpectedError> {
    // TODO: Implement actual pack listing from bazaar service
    return makeSuccessfulResult([]);
  }
}
