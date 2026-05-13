import type {
  Backend,
  GlobalSettings,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import BackendUsecase from "../../utils/BackendUsecase.js";
import { globalSettings as globalSettingsSchema } from "../../validation/domain/globalSettings.js";
import { unexpectedError } from "../../validation/errors.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class GlobalSettingsGet extends BackendUsecase<
  Backend["globalSettings"]["get"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = makeResultSchema(globalSettingsSchema(), [unexpectedError()]);

  async exec(): ResultPromise<GlobalSettings, UnexpectedError> {
    const globalSettings = await this.repos.globalSettings.get();
    return makeSuccessfulResult(globalSettings);
  }
}
