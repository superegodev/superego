import type { Backend, LitePack, UnexpectedError } from "@superego/backend";
import { packs } from "@superego/boutique";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import makeLitePack from "../../makers/makeLitePack.js";
import Usecase from "../../utils/Usecase.js";

export default class BoutiqueListPacks extends Usecase<
  Backend["boutique"]["listPacks"]
> {
  async exec(): ResultPromise<LitePack[], UnexpectedError> {
    return makeSuccessfulResult(packs.map(makeLitePack));
  }
}
