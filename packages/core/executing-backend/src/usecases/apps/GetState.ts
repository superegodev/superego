import type {
  AppState,
  AppNotFound,
  AppStateError,
  UnexpectedError,
} from "@superego/backend";
import type { Backend } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  appStateFailure,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class AppsGetState extends BackendUsecase<
  Backend["apps"]["getState"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.appId(),
    structuralSchemas.backend.ids.appVersionId(),
    v.nullable(structuralSchemas.backend.ids.appVersionId()),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.appState(),
    [
      structuralSchemas.backend.errors.appNotFound(),
      structuralSchemas.backend.errors.appStateError(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );
  async exec(
    ...[id, versionId, schemaId]: Parameters<Backend["apps"]["getState"]>
  ): ResultPromise<AppState, AppNotFound | AppStateError | UnexpectedError> {
    const app = await this.repos.app.find(id);
    if (!app) {
      return makeUnsuccessfulResult({
        name: "AppNotFound",
        details: { appId: id },
      });
    }
    if (!app.state) {
      return appStateFailure("StateNotDefined");
    }
    if (app.state.schemaId !== schemaId) {
      return appStateFailure("ObsoleteSchema");
    }
    const version = await this.repos.appVersion.findLatestWhereAppIdEq(id);
    if (version?.id !== versionId) {
      return appStateFailure("ObsoleteVersion");
    }
    return makeSuccessfulResult(app.state);
  }
}
