import type {
  AppState,
  AppStateDefinition,
  AppVersionId,
  Backend,
} from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import {
  appStateFailure,
  appStateSchema,
  isJsonValue,
  makeSuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";

/** Each preview owns this ephemeral store; production repositories are never used. */
export default function createPreviewState(
  definition: AppStateDefinition | undefined,
  schemaId: AppVersionId,
  notify: () => void,
) {
  let state: AppState | undefined;
  if (
    definition &&
    v.safeParse(appStateSchema(), definition.schema).success &&
    isJsonValue(definition.initialState) &&
    v.safeParse(
      valibotSchemas.content(definition.schema),
      definition.initialState,
    ).success
  ) {
    state = {
      content: structuredClone(definition.initialState),
      revision: 1,
      schemaId,
    };
  }
  return {
    get: async (): ReturnType<Backend["apps"]["getState"]> =>
      state
        ? makeSuccessfulResult(structuredClone(state))
        : appStateFailure(definition ? "ContentNotValid" : "StateNotDefined"),
    update: async (
      expectedRevision: number,
      content: Record<string, unknown>,
    ): ReturnType<Backend["apps"]["updateState"]> => {
      if (!state || !definition) {
        return appStateFailure("StateNotDefined");
      }
      if (expectedRevision !== state.revision) {
        return appStateFailure("RevisionConflict");
      }
      if (
        !isJsonValue(content) ||
        !v.safeParse(valibotSchemas.content(definition.schema), content).success
      ) {
        return appStateFailure("ContentNotValid");
      }
      state = {
        ...state,
        content: structuredClone(content),
        revision: state.revision + 1,
      };
      notify();
      return makeSuccessfulResult(structuredClone(state));
    },
  };
}
