import type { Backend, LitePack, UnexpectedError } from "@superego/backend";
import { packs } from "@superego/boutique";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import makeLitePack from "../../makers/makeLitePack.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class BoutiqueListPacks extends BackendUsecase<
  Backend["boutique"]["listPacks"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = structuralSchemas.global.result(
    v.array(structuralSchemas.backend.types.litePack()),
    [structuralSchemas.backend.errors.unexpectedError()],
  );

  async exec(): ResultPromise<LitePack[], UnexpectedError> {
    return makeSuccessfulResult(packs.map(makeLitePack));
  }
}
