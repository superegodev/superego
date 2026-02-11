import type { Backend, LitePack, UnexpectedError } from "@superego/backend";
import { packs } from "@superego/bazaar";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import makeLitePack from "../../makers/makeLitePack.js";
import Usecase from "../../utils/Usecase.js";

export default class BazaarListPacks extends Usecase<
  Backend["bazaar"]["listPacks"]
> {
  async exec(): ResultPromise<LitePack[], UnexpectedError> {
    return makeSuccessfulResult(packs.map(makeLitePack));
  }
}
