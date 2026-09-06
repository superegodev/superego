import type {
  AppId,
  AppState,
  AppStateContentNotValid,
  AppStateDefinition,
  AppStateNotDefined,
  AppStateRevisionNotMatching,
  AppStateSchemaNotValid,
  AppVersionId,
  ValidationIssue,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  appStateContentSchema,
  appStateSchema,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";

/** Each preview owns this ephemeral store; production repositories are never used. */
export default function createPreviewState(
  appId: AppId,
  definition: AppStateDefinition | undefined,
  schemaId: AppVersionId,
) {
  let state: AppState | undefined;
  let initializationError:
    | AppStateSchemaNotValid
    | AppStateContentNotValid
    | undefined;
  if (definition) {
    const schemaValidationResult = v.safeParse(
      appStateSchema(),
      definition.schema,
    );
    if (!schemaValidationResult.success) {
      initializationError = {
        name: "AppStateSchemaNotValid",
        details: {
          appId,
          issues: makeValidationIssues(schemaValidationResult.issues),
        },
      };
    } else {
      const contentValidationResult = v.safeParse(
        appStateContentSchema(definition.schema),
        definition.initialState,
      );
      if (!contentValidationResult.success) {
        initializationError = {
          name: "AppStateContentNotValid",
          details: {
            appId,
            schemaId,
            issues: makeValidationIssues(contentValidationResult.issues),
          },
        };
      } else {
        state = {
          content: structuredClone(definition.initialState),
          revision: 1,
          schemaId,
        };
      }
    }
  }
  return {
    get: async (): ResultPromise<
      AppState,
      AppStateNotDefined | AppStateSchemaNotValid | AppStateContentNotValid
    > => {
      if (initializationError) {
        return makeUnsuccessfulResult(initializationError);
      }
      if (!state) {
        return makeUnsuccessfulResult<AppStateNotDefined>({
          name: "AppStateNotDefined",
          details: { appId },
        });
      }
      return makeSuccessfulResult(structuredClone(state));
    },
    update: async (
      expectedRevision: number,
      content: Record<string, unknown>,
    ): ResultPromise<
      AppState,
      | AppStateNotDefined
      | AppStateSchemaNotValid
      | AppStateContentNotValid
      | AppStateRevisionNotMatching
    > => {
      if (initializationError) {
        return makeUnsuccessfulResult(initializationError);
      }
      if (!state || !definition) {
        return makeUnsuccessfulResult<AppStateNotDefined>({
          name: "AppStateNotDefined",
          details: { appId },
        });
      }
      if (expectedRevision !== state.revision) {
        return makeUnsuccessfulResult<AppStateRevisionNotMatching>({
          name: "AppStateRevisionNotMatching",
          details: {
            appId,
            latestRevision: state.revision,
            suppliedRevision: expectedRevision,
          },
        });
      }
      const contentValidationResult = v.safeParse(
        appStateContentSchema(definition.schema),
        content,
      );
      if (!contentValidationResult.success) {
        return makeUnsuccessfulResult<AppStateContentNotValid>({
          name: "AppStateContentNotValid",
          details: {
            appId,
            schemaId,
            issues: makeValidationIssues(contentValidationResult.issues),
          },
        });
      }
      state = {
        ...state,
        content: structuredClone(content),
        revision: state.revision + 1,
      };
      return makeSuccessfulResult(structuredClone(state));
    },
  };
}

function makeValidationIssues(issues: v.GenericIssue[]): ValidationIssue[] {
  return issues.map((issue) => ({
    message: issue.message,
    path: issue.path?.map(({ key }) => ({
      key: typeof key === "number" ? key : String(key),
    })),
  }));
}
