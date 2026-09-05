import type {
  AppState,
  AppStateDefinition,
  AppStateError,
  AppVersionId,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { valibotSchemas } from "@superego/schema";
import {
  appStateSchema,
  appStateFailure,
  isJsonValue,
  makeSuccessfulResult,
} from "@superego/shared-utils";
import { isEqual } from "es-toolkit";
import * as v from "valibot";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";

/** Caller holds the serializable transaction across migration and persistence. */
export default async function transitionAppState(
  definition: AppStateDefinition | null | undefined,
  previousDefinition: AppStateDefinition | undefined,
  current: AppState | undefined,
  versionId: AppVersionId,
  javascriptSandbox: JavascriptSandbox,
): ResultPromise<AppState | undefined, AppStateError> {
  if (!definition) {
    return current
      ? appStateFailure("SchemaRemovalNotAllowed")
      : makeSuccessfulResult(undefined);
  }
  if (!v.safeParse(appStateSchema(), definition.schema).success) {
    return appStateFailure("SchemaNotValid");
  }
  const contentSchema = valibotSchemas.content(definition.schema);
  if (
    !isJsonValue(definition.initialState) ||
    !v.safeParse(contentSchema, definition.initialState).success
  ) {
    return appStateFailure("ContentNotValid");
  }
  if (!current) {
    return makeSuccessfulResult({
      content: definition.initialState,
      revision: 1,
      schemaId: versionId,
    });
  }
  let content = current.content;
  if (definition.migration) {
    try {
      if (
        !(await javascriptSandbox.moduleDefaultExportsFunction(
          definition.migration,
        ))
      ) {
        return appStateFailure("MigrationFailed");
      }
      const result = await javascriptSandbox.executeSyncFunction(
        definition.migration,
        [content],
      );
      if (!result.success) {
        return appStateFailure("MigrationFailed");
      }
      content = result.data;
    } catch {
      return appStateFailure("MigrationFailed");
    }
  }
  if (!isJsonValue(content) || !v.safeParse(contentSchema, content).success) {
    return appStateFailure(
      definition.migration ? "MigrationFailed" : "MigrationRequired",
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
