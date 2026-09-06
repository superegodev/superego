import type {
  AppId,
  AppState,
  AppStateContentNotValid,
  AppStateDefinition,
  AppStateMigrationFailed,
  AppStateMigrationNotValid,
  AppStateMigrationRequired,
  AppStateSchemaNotValid,
  AppStateSchemaRemovalNotAllowed,
  AppVersionId,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  appStateContentSchema,
  extractErrorDetails,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import { isEqual } from "es-toolkit";
import * as v from "valibot";
import makeExecutingTypescriptFunctionFailed from "../makers/makeExecutingTypescriptFunctionFailed.js";
import makeInitialAppState from "../makers/makeInitialAppState.js";
import makeResultError from "../makers/makeResultError.js";
import makeValidationIssues from "../makers/makeValidationIssues.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";

/** Caller holds the serializable transaction across migration and persistence. */
export default async function transitionAppState(
  appId: AppId,
  definition: AppStateDefinition | null,
  previousDefinition: AppStateDefinition | undefined,
  current: AppState | undefined,
  versionId: AppVersionId,
  javascriptSandbox: JavascriptSandbox,
): ResultPromise<
  AppState | undefined,
  | AppStateSchemaNotValid
  | AppStateContentNotValid
  | AppStateSchemaRemovalNotAllowed
  | AppStateMigrationRequired
  | AppStateMigrationNotValid
  | AppStateMigrationFailed
> {
  if (!definition) {
    if (current) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateSchemaRemovalNotAllowed", { appId }),
      );
    }
    return makeSuccessfulResult(undefined);
  }

  const initialStateResult = makeInitialAppState(appId, definition, versionId);
  if (!initialStateResult.success || !current) {
    return initialStateResult;
  }

  let content = current.content;
  if (definition.migration) {
    try {
      if (
        !(await javascriptSandbox.moduleDefaultExportsFunction(
          definition.migration,
        ))
      ) {
        return makeUnsuccessfulResult(
          makeResultError("AppStateMigrationNotValid", {
            appId,
            issues: [
              {
                message:
                  "The default export of the migration TypescriptModule is not a function",
              },
            ],
          }),
        );
      }
      const result = await javascriptSandbox.executeSyncFunction(
        definition.migration,
        [content],
      );
      if (!result.success) {
        return makeUnsuccessfulResult(
          makeResultError("AppStateMigrationFailed", {
            appId,
            cause: makeExecutingTypescriptFunctionFailed(result.error),
          }),
        );
      }
      content = result.data;
    } catch (error) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateMigrationFailed", {
          appId,
          cause: makeResultError("UnexpectedError", {
            cause: extractErrorDetails(error),
          }),
        }),
      );
    }
  }

  const contentValidationResult = v.safeParse(
    appStateContentSchema(definition.schema),
    content,
  );
  if (!contentValidationResult.success) {
    const issues = makeValidationIssues(contentValidationResult.issues);
    if (definition.migration) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateMigrationFailed", {
          appId,
          cause: makeResultError("AppStateContentNotValid", {
            appId,
            schemaId: versionId,
            issues,
          }),
        }),
      );
    }
    return makeUnsuccessfulResult(
      makeResultError("AppStateMigrationRequired", {
        appId,
        previousSchemaId: current.schemaId,
        targetSchemaId: versionId,
        issues,
      }),
    );
  }

  const transitioned =
    !!definition.migration ||
    !isEqual(definition.schema, previousDefinition?.schema);
  return makeSuccessfulResult({
    content,
    revision: current.revision + (transitioned ? 1 : 0),
    schemaId: transitioned ? versionId : current.schemaId,
  });
}
