import type {
  Backend,
  Pack,
  PackId,
  PackNotFound,
  UnexpectedError,
} from "@superego/backend";
import { packs } from "@superego/bazaar";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class BazaarGetPack extends Usecase<
  Backend["bazaar"]["getPack"]
> {
  @validateArgs([valibotSchemas.id.pack()])
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
