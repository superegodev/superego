import type {
  AppId,
  AppState,
  AppStateContentNotValid,
  AppStateDefinition,
  AppStateSchemaNotValid,
} from "@superego/backend";
import type { Result } from "@superego/global-types";
import {
  appStateContentSchema,
  appStateSchema,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "./makeResultError.js";
import makeValidationIssues from "./makeValidationIssues.js";

export default function makeInitialAppState(
  appId: AppId | null,
  definition: AppStateDefinition,
): Result<AppState, AppStateSchemaNotValid | AppStateContentNotValid> {
  const schemaValidationResult = v.safeParse(
    appStateSchema(),
    definition.schema,
  );
  if (!schemaValidationResult.success) {
    return makeUnsuccessfulResult(
      makeResultError("AppStateSchemaNotValid", {
        appId,
        issues: makeValidationIssues(schemaValidationResult.issues),
      }),
    );
  }

  const contentValidationResult = v.safeParse(
    appStateContentSchema(definition.schema),
    definition.initialState,
  );
  if (!contentValidationResult.success) {
    return makeUnsuccessfulResult(
      makeResultError("AppStateContentNotValid", {
        appId,
        issues: makeValidationIssues(contentValidationResult.issues),
      }),
    );
  }

  return makeSuccessfulResult({
    content: definition.initialState,
    revision: 1,
  });
}
