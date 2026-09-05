import type {
  AppState,
  AppNotFound,
  AppStateError,
  UnexpectedError,
} from "@superego/backend";
import type { Backend } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { valibotSchemas } from "@superego/schema";
import {
  appStateFailure,
  isJsonValue,
  makeSuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
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
      structuralSchemas.backend.errors.appStateError(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );
  async exec(
    ...[id, versionId, schemaId, expectedRevision, content]: Parameters<
      Backend["apps"]["updateState"]
    >
  ): ResultPromise<AppState, AppNotFound | AppStateError | UnexpectedError> {
    const result = await this.sub(AppsGetState).exec(id, versionId, schemaId);
    if (!result.success) {
      return result;
    }
    if (result.data.revision !== expectedRevision) {
      return appStateFailure("RevisionConflict");
    }
    const version = await this.repos.appVersion.findLatestWhereAppIdEq(id);
    if (!version?.state) {
      return appStateFailure("StateNotDefined");
    }
    if (
      !isJsonValue(content) ||
      !v.safeParse(valibotSchemas.content(version.state.schema), content)
        .success
    ) {
      return appStateFailure("ContentNotValid");
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
