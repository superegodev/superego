import type {
  Backend,
  Pack,
  PackId,
  PackNotFound,
  UnexpectedError,
} from "@superego/backend";
import { packs } from "@superego/boutique";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";

export default class BoutiqueGetPack extends Usecase<
  Backend["boutique"]["getPack"]
> {
  async exec(id: PackId): ResultPromise<Pack, PackNotFound | UnexpectedError> {
    const pack = packs.find((pack) => pack.id === id);
    if (!pack) {
      return makeUnsuccessfulResult(
        makeResultError("PackNotFound", { packId: id }),
      );
    }

    return makeSuccessfulResult(pack);
  }
}
