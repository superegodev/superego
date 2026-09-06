import type {
  App,
  AppId,
  AppNotFound,
  AppStateContentNotValid,
  AppStateMigrationFailed,
  AppStateMigrationNotValid,
  AppStateMigrationRequired,
  AppStateSchemaNotValid,
  AppStateSchemaRemovalNotAllowed,
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
  appPermissionsSchema,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import type AppVersionEntity from "../../entities/AppVersionEntity.js";
import makeApp from "../../makers/makeApp.js";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertAppVersionExists from "../../utils/assertAppVersionExists.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import transitionAppState from "../../utils/transitionAppState.js";

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
    v.optional(
      v.strictObject({
        permissions: v.optional(appPermissionsSchema()),
        state: v.optional(
          v.nullable(structuralSchemas.backend.types.appStateDefinition()),
        ),
      }),
    ),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.app(),
    [
      structuralSchemas.backend.errors.appNotFound(),
      structuralSchemas.backend.errors.appStateSchemaNotValid(),
      structuralSchemas.backend.errors.appStateContentNotValid(),
      structuralSchemas.backend.errors.appStateSchemaRemovalNotAllowed(),
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
    options: Parameters<Backend["apps"]["createNewVersion"]>[4] = {},
  ): ResultPromise<
    App,
    | AppStateSchemaNotValid
    | AppStateContentNotValid
    | AppStateSchemaRemovalNotAllowed
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

    const appVersion: AppVersionEntity = {
      id: Id.generate.appVersion(),
      previousVersionId: previousVersion.id,
      appId: app.id,
      targetCollections,
      files: files,
      permissions: options.permissions ?? previousVersion.permissions,
      state:
        options.state === undefined
          ? previousVersion.state
          : (options.state ?? undefined),
      stateSchemaId: previousVersion.stateSchemaId,
      createdAt: new Date(),
    };

    // Omitted state means a code/permissions update; do not replay an old migration.
    if (options.state !== undefined) {
      const stateResult = await transitionAppState(
        app.id,
        options.state,
        previousVersion.state,
        app.state,
        appVersion.id,
        this.javascriptSandbox,
      );
      if (!stateResult.success) {
        return stateResult;
      }
      app.state = stateResult.data;
      appVersion.stateSchemaId = app.state?.schemaId;
      await this.repos.app.replace(app);
    }
    await this.repos.appVersion.insert(appVersion);

    return makeSuccessfulResult(makeApp(app, appVersion));
  }
}
