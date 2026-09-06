import type {
  AppNotFound,
  AppState,
  AppStateNotDefined,
  AppStateSchemaIdNotMatching,
  AppVersionIdNotMatching,
  Backend,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertAppVersionExists from "../../utils/assertAppVersionExists.js";
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
      structuralSchemas.backend.errors.appStateNotDefined(),
      structuralSchemas.backend.errors.appStateSchemaIdNotMatching(),
      structuralSchemas.backend.errors.appVersionIdNotMatching(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );
  async exec(
    ...[id, versionId, schemaId]: Parameters<Backend["apps"]["getState"]>
  ): ResultPromise<
    AppState,
    | AppNotFound
    | AppStateNotDefined
    | AppStateSchemaIdNotMatching
    | AppVersionIdNotMatching
    | UnexpectedError
  > {
    const app = await this.repos.app.find(id);
    if (!app) {
      return makeUnsuccessfulResult(
        makeResultError("AppNotFound", { appId: id }),
      );
    }
    if (!app.state) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateNotDefined", { appId: id }),
      );
    }
    if (app.state.schemaId !== schemaId) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateSchemaIdNotMatching", {
          appId: id,
          latestSchemaId: app.state.schemaId,
          suppliedSchemaId: schemaId,
        }),
      );
    }
    const version = await this.repos.appVersion.findLatestWhereAppIdEq(id);
    assertAppVersionExists(id, version);
    if (version.id !== versionId) {
      return makeUnsuccessfulResult(
        makeResultError("AppVersionIdNotMatching", {
          appId: id,
          latestVersionId: version.id,
          suppliedVersionId: versionId,
        }),
      );
    }
    return makeSuccessfulResult(app.state);
  }
}
