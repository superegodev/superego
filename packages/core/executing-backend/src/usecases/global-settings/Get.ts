import type {
  Backend,
  GlobalSettings,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class GlobalSettingsGet extends BackendUsecase<
  Backend["globalSettings"]["get"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.globalSettings(),
    [structuralSchemas.backend.errors.unexpectedError()],
  );

  async exec(): ResultPromise<GlobalSettings, UnexpectedError> {
    const globalSettings = await this.repos.globalSettings.get();
    return makeSuccessfulResult(globalSettings);
  }
}
