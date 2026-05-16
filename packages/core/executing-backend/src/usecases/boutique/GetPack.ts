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
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class BoutiqueGetPack extends BackendUsecase<
  Backend["boutique"]["getPack"]
> {
  argumentsSchema = v.tuple([structuralSchemas.backend.ids.packId()]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.pack(),
    [
      structuralSchemas.backend.errors.packNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

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
