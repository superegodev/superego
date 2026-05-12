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
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";
import { pack } from "../../validation/domain/pack.js";
import { packNotFound, unexpectedError } from "../../validation/errors.js";
import { packId } from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class BoutiqueGetPack extends Usecase<
  Backend["boutique"]["getPack"]
> {
  argumentsSchema = v.tuple([packId()]);
  resultSchema = makeResultSchema(pack(), [packNotFound(), unexpectedError()]);

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
