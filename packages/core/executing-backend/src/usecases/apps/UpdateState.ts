import type {
  AppNotFound,
  AppState,
  AppStateContentNotValid,
  AppStateRevisionNotMatching,
  AppVersionIdNotMatching,
  Backend,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeUnsuccessfulResult,
  makeSuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertAppVersionExists from "../../utils/assertAppVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import AppsGetState from "./GetState.js";

export default class AppsUpdateState extends BackendUsecase<
  Backend["apps"]["updateState"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.appId(),
    structuralSchemas.backend.ids.appVersionId(),
    v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
    v.any(),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.appState(),
    [
      structuralSchemas.backend.errors.appNotFound(),
      structuralSchemas.backend.errors.appVersionIdNotMatching(),
      structuralSchemas.backend.errors.appStateRevisionNotMatching(),
      structuralSchemas.backend.errors.appStateContentNotValid(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    ...[id, versionId, latestRevision, content]: Parameters<
      Backend["apps"]["updateState"]
    >
  ): ResultPromise<
    AppState,
    | AppNotFound
    | AppVersionIdNotMatching
    | AppStateRevisionNotMatching
    | AppStateContentNotValid
    | UnexpectedError
  > {
    const result = await this.sub(AppsGetState).exec(id, versionId);
    if (!result.success) {
      return result;
    }

    if (result.data.revision !== latestRevision) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateRevisionNotMatching", {
          appId: id,
          latestRevision: result.data.revision,
          suppliedRevision: latestRevision,
        }),
      );
    }

    const version = await this.repos.appVersion.findLatestWhereAppIdEq(id);
    assertAppVersionExists(id, version);

    const contentValidationResult = v.safeParse(
      valibotSchemas.appStateContent(version.stateDefinition.schema),
      content,
    );
    if (!contentValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateContentNotValid", {
          appId: id,
          issues: makeValidationIssues(contentValidationResult.issues),
        }),
      );
    }

    const app = (await this.repos.app.find(id))!;
    const state = {
      content,
      revision: result.data.revision + 1,
    };
    await this.repos.app.replace({ ...app, state });

    return makeSuccessfulResult(state);
  }
}
