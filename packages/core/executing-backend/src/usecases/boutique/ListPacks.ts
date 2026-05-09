import {
  backendContracts,
  type LitePack,
  type UnexpectedError,
} from "@superego/backend";
import { packs } from "@superego/boutique";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import makeLitePack from "../../makers/makeLitePack.js";
import Usecase from "../../utils/Usecase.js";

export default class BoutiqueListPacks extends Usecase<
  typeof backendContracts.boutique.listPacks
> {
  async exec(): ResultPromise<LitePack[], UnexpectedError> {
    return makeSuccessfulResult(packs.map(makeLitePack));
  }
}
