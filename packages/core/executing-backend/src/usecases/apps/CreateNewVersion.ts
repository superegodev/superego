import type {
  App,
  AppId,
  AppNotFound,
  AppPermissions,
  AppStateDefinition,
  AppStateContentNotValid,
  AppStateMigrationFailed,
  AppStateMigrationNotValid,
  AppStateMigrationRequired,
  AppStateSchemaNotValid,
  AppVersionId,
  AppVersionIdNotMatching,
  Backend,
  CollectionId,
  CollectionNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  Id,
  extractErrorDetails,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import { isEqual } from "es-toolkit";
import * as v from "valibot";
import type AppVersionEntity from "../../entities/AppVersionEntity.js";
import makeApp from "../../makers/makeApp.js";
import makeExecutingTypescriptFunctionFailed from "../../makers/makeExecutingTypescriptFunctionFailed.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertAppVersionExists from "../../utils/assertAppVersionExists.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class AppsCreateNewVersion extends BackendUsecase<
  Backend["apps"]["createNewVersion"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.appId(),
    structuralSchemas.backend.ids.appVersionId(),
    v.array(structuralSchemas.backend.ids.collectionId()),
    v.strictObject({
      "/main.tsx": structuralSchemas.backend.types.typescriptModule(),
    }),
    structuralSchemas.backend.types.appPermissions(),
    structuralSchemas.backend.types.appStateDefinition(),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.app(),
    [
      structuralSchemas.backend.errors.appNotFound(),
      structuralSchemas.backend.errors.appStateSchemaNotValid(),
      structuralSchemas.backend.errors.appStateContentNotValid(),
      structuralSchemas.backend.errors.appStateMigrationRequired(),
      structuralSchemas.backend.errors.appStateMigrationNotValid(),
      structuralSchemas.backend.errors.appStateMigrationFailed(),
      structuralSchemas.backend.errors.appVersionIdNotMatching(),
      structuralSchemas.backend.errors.collectionNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    id: AppId,
    latestVersionId: AppVersionId,
    targetCollectionIds: CollectionId[],
    files: AppVersionEntity["files"],
    permissions: AppPermissions,
    stateDefinition: AppStateDefinition,
  ): ResultPromise<
    App,
    | AppStateSchemaNotValid
    | AppStateContentNotValid
    | AppStateMigrationRequired
    | AppStateMigrationNotValid
    | AppStateMigrationFailed
    | AppVersionIdNotMatching
    | AppNotFound
    | CollectionNotFound
    | UnexpectedError
  > {
    const app = await this.repos.app.find(id);
    if (!app) {
      return makeUnsuccessfulResult(
        makeResultError("AppNotFound", { appId: id }),
      );
    }

    const previousVersion = await this.repos.appVersion.findLatestWhereAppIdEq(
      app.id,
    );
    assertAppVersionExists(app.id, previousVersion);
    if (latestVersionId !== previousVersion.id) {
      return makeUnsuccessfulResult(
        makeResultError("AppVersionIdNotMatching", {
          appId: id,
          latestVersionId: previousVersion.id,
          suppliedVersionId: latestVersionId,
        }),
      );
    }

    const targetCollections: AppVersionEntity["targetCollections"] = [];
    for (const collectionId of targetCollectionIds) {
      const collection = await this.repos.collection.find(collectionId);
      if (!collection) {
        return makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", { collectionId }),
        );
      }

      const latestCollectionVersion =
        await this.repos.collectionVersion.findLatestWhereCollectionIdEq(
          collectionId,
        );
      assertCollectionVersionExists(collectionId, latestCollectionVersion);
      targetCollections.push({
        id: collectionId,
        versionId: latestCollectionVersion.id,
      });
    }

    // Validate state schema.
    const schemaValidationResult = v.safeParse(
      valibotSchemas.appStateSchema(),
      stateDefinition.schema,
    );
    if (!schemaValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateSchemaNotValid", {
          appId: id,
          issues: makeValidationIssues(schemaValidationResult.issues),
        }),
      );
    }

    // Validate initial state.
    const initialStateValidationResult = v.safeParse(
      valibotSchemas.appStateContent(stateDefinition.schema),
      stateDefinition.initialState,
    );
    if (!initialStateValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateContentNotValid", {
          appId: id,
          issues: makeValidationIssues(initialStateValidationResult.issues),
        }),
      );
    }

    // Apply the supplied migration to the current saved state.
    let content = app.state.content;
    if (stateDefinition.migration !== null) {
      try {
        if (
          !(await this.javascriptSandbox.moduleDefaultExportsFunction(
            stateDefinition.migration,
          ))
        ) {
          return makeUnsuccessfulResult(
            makeResultError("AppStateMigrationNotValid", {
              appId: id,
              issues: [
                {
                  message:
                    "The default export of the migration TypescriptModule is not a function",
                },
              ],
            }),
          );
        }
        const migrationResult =
          await this.javascriptSandbox.executeSyncFunction(
            stateDefinition.migration,
            [content],
          );
        if (!migrationResult.success) {
          return makeUnsuccessfulResult(
            makeResultError("AppStateMigrationFailed", {
              appId: id,
              cause: makeExecutingTypescriptFunctionFailed(
                migrationResult.error,
              ),
            }),
          );
        }
        content = migrationResult.data;
      } catch (error) {
        return makeUnsuccessfulResult(
          makeResultError("AppStateMigrationFailed", {
            appId: id,
            cause: makeResultError("UnexpectedError", {
              cause: extractErrorDetails(error),
            }),
          }),
        );
      }
    }

    // Validate saved state against the new schema, even without a migration.
    const contentValidationResult = v.safeParse(
      valibotSchemas.appStateContent(stateDefinition.schema),
      content,
    );
    if (!contentValidationResult.success) {
      const issues = makeValidationIssues(contentValidationResult.issues);
      if (stateDefinition.migration !== null) {
        return makeUnsuccessfulResult(
          makeResultError("AppStateMigrationFailed", {
            appId: id,
            cause: makeResultError("AppStateContentNotValid", {
              appId: id,
              issues,
            }),
          }),
        );
      }
      return makeUnsuccessfulResult(
        makeResultError("AppStateMigrationRequired", { appId: id, issues }),
      );
    }

    // Persist the new version and state in the same transaction.
    const appVersion: AppVersionEntity = {
      id: Id.generate.appVersion(),
      previousVersionId: previousVersion.id,
      appId: app.id,
      targetCollections,
      files,
      permissions,
      stateDefinition,
      createdAt: new Date(),
    };
    const stateChanged =
      stateDefinition.migration !== null ||
      !isEqual(stateDefinition.schema, previousVersion.stateDefinition.schema);
    app.state = {
      content,
      revision: app.state.revision + (stateChanged ? 1 : 0),
    };
    await this.repos.app.replace(app);
    await this.repos.appVersion.insert(appVersion);

    return makeSuccessfulResult(makeApp(app, appVersion));
  }
}
