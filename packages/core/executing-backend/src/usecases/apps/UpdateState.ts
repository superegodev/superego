import type {
  AppNotFound,
  AppState,
  AppStateContentNotValid,
  AppStateNotDefined,
  AppStateRevisionNotMatching,
  AppStateSchemaIdNotMatching,
  AppVersionIdNotMatching,
  Backend,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  appStateContentSchema,
  makeUnsuccessfulResult,
  makeSuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import AppsGetState from "./GetState.js";

export default class AppsUpdateState extends BackendUsecase<
  Backend["apps"]["updateState"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.appId(),
    structuralSchemas.backend.ids.appVersionId(),
    v.nullable(structuralSchemas.backend.ids.appVersionId()),
    v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
    v.record(v.string(), v.unknown()),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.appState(),
    [
      structuralSchemas.backend.errors.appNotFound(),
      structuralSchemas.backend.errors.appStateNotDefined(),
      structuralSchemas.backend.errors.appStateSchemaIdNotMatching(),
      structuralSchemas.backend.errors.appVersionIdNotMatching(),
      structuralSchemas.backend.errors.appStateRevisionNotMatching(),
      structuralSchemas.backend.errors.appStateContentNotValid(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );
  async exec(
    ...[id, versionId, schemaId, expectedRevision, content]: Parameters<
      Backend["apps"]["updateState"]
    >
  ): ResultPromise<
    AppState,
    | AppNotFound
    | AppStateNotDefined
    | AppStateSchemaIdNotMatching
    | AppVersionIdNotMatching
    | AppStateRevisionNotMatching
    | AppStateContentNotValid
    | UnexpectedError
  > {
    const result = await this.sub(AppsGetState).exec(id, versionId, schemaId);
    if (!result.success) {
      return result;
    }
    if (result.data.revision !== expectedRevision) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateRevisionNotMatching", {
          appId: id,
          latestRevision: result.data.revision,
          suppliedRevision: expectedRevision,
        }),
      );
    }
    const version = await this.repos.appVersion.findLatestWhereAppIdEq(id);
    if (!version?.state) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateNotDefined", { appId: id }),
      );
    }
    const contentValidationResult = v.safeParse(
      appStateContentSchema(version.state.schema),
      content,
    );
    if (!contentValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateContentNotValid", {
          appId: id,
          schemaId: result.data.schemaId,
          issues: makeValidationIssues(contentValidationResult.issues),
        }),
      );
    }
    const app = (await this.repos.app.find(id))!;
    const state = {
      content,
      revision: result.data.revision + 1,
      schemaId: result.data.schemaId,
    };
    await this.repos.app.replace({ ...app, state });
    return makeSuccessfulResult(state);
  }
}
