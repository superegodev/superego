import type {
  AppId,
  AppState,
  AppStateContentNotValid,
  AppStateDefinition,
  AppStateRevisionNotMatching,
  AppStateSchemaNotValid,
  ValidationIssue,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";

/** Each preview owns this ephemeral store; production repositories are never used. */
export default function createPreviewState(
  appId: AppId,
  definition: AppStateDefinition,
) {
  let state: AppState = {
    content: {},
    revision: 1,
  };
  let initializationError:
    | AppStateSchemaNotValid
    | AppStateContentNotValid
    | undefined;
  const schemaValidationResult = v.safeParse(
    valibotSchemas.appStateSchema(),
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
      valibotSchemas.appStateContent(definition.schema),
      definition.initialState,
    );
    if (!contentValidationResult.success) {
      initializationError = {
        name: "AppStateContentNotValid",
        details: {
          appId,
          issues: makeValidationIssues(contentValidationResult.issues),
        },
      };
    }
  }
  if (!initializationError) {
    state.content = structuredClone(definition.initialState);
  }
  return {
    get: async (): ResultPromise<
      AppState,
      AppStateSchemaNotValid | AppStateContentNotValid
    > => {
      if (initializationError) {
        return makeUnsuccessfulResult(initializationError);
      }
      return makeSuccessfulResult(structuredClone(state));
    },
    update: async (
      latestRevision: number,
      content: any,
    ): ResultPromise<
      AppState,
      | AppStateSchemaNotValid
      | AppStateContentNotValid
      | AppStateRevisionNotMatching
    > => {
      if (initializationError) {
        return makeUnsuccessfulResult(initializationError);
      }
      if (latestRevision !== state.revision) {
        return makeUnsuccessfulResult<AppStateRevisionNotMatching>({
          name: "AppStateRevisionNotMatching",
          details: {
            appId,
            latestRevision: state.revision,
            suppliedRevision: latestRevision,
          },
        });
      }
      const contentValidationResult = v.safeParse(
        valibotSchemas.appStateContent(definition.schema),
        content,
      );
      if (!contentValidationResult.success) {
        return makeUnsuccessfulResult<AppStateContentNotValid>({
          name: "AppStateContentNotValid",
          details: {
            appId,
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
