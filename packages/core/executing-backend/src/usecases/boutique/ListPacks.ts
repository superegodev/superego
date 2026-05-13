import type { Backend, LitePack, UnexpectedError } from "@superego/backend";
import { packs } from "@superego/boutique";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import makeLitePack from "../../makers/makeLitePack.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import { litePack } from "../../validation/domain/pack.js";
import { unexpectedError } from "../../validation/errors.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class BoutiqueListPacks extends BackendUsecase<
  Backend["boutique"]["listPacks"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = makeResultSchema(v.array(litePack()), [unexpectedError()]);

  async exec(): ResultPromise<LitePack[], UnexpectedError> {
    return makeSuccessfulResult(packs.map(makeLitePack));
  }
}
