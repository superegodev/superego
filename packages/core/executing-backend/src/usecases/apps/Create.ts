import type {
  App,
  AppDefinition,
  AppId,
  AppNameNotValid,
  AppStateContentNotValid,
  AppStateSchemaNotValid,
  Backend,
  CollectionNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  Id,
  appStateSchema,
  appStateContentSchema,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import type AppEntity from "../../entities/AppEntity.js";
import type AppVersionEntity from "../../entities/AppVersionEntity.js";
import makeApp from "../../makers/makeApp.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

interface AppsCreateOptions {
  appId?: AppId;
}

export default class AppsCreate extends BackendUsecase<
  Backend["apps"]["create"]
> {
  argumentsSchema = v.tuple([structuralSchemas.backend.types.appDefinition()]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.app(),
    [
      structuralSchemas.backend.errors.appNameNotValid(),
      structuralSchemas.backend.errors.appStateSchemaNotValid(),
      structuralSchemas.backend.errors.appStateContentNotValid(),
      structuralSchemas.backend.errors.collectionNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    {
      type,
      name,
      targetCollectionIds,
      files,
      permissions,
      stateDefinition,
    }: AppDefinition,
    options: AppsCreateOptions = {},
  ): ResultPromise<
    App,
    | AppStateSchemaNotValid
    | AppStateContentNotValid
    | AppNameNotValid
    | CollectionNotFound
    | UnexpectedError
  > {
    const nameValidationResult = v.safeParse(valibotSchemas.appName(), name);
    if (!nameValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("AppNameNotValid", {
          appId: null,
          issues: makeValidationIssues(nameValidationResult.issues),
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
      appStateSchema(),
      stateDefinition.schema,
    );
    if (!schemaValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateSchemaNotValid", {
          appId: null,
          issues: makeValidationIssues(schemaValidationResult.issues),
        }),
      );
    }

    // Validate initial state.
    const initialStateValidationResult = v.safeParse(
      appStateContentSchema(stateDefinition.schema),
      stateDefinition.initialState,
    );
    if (!initialStateValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("AppStateContentNotValid", {
          appId: null,
          issues: makeValidationIssues(initialStateValidationResult.issues),
        }),
      );
    }

    const now = new Date();
    const app: AppEntity = {
      id: options.appId ?? Id.generate.app(),
      state: { content: stateDefinition.initialState, revision: 1 },
      type: type,
      name: nameValidationResult.output,
      createdAt: now,
    };
    const appVersion: AppVersionEntity = {
      id: Id.generate.appVersion(),
      previousVersionId: null,
      appId: app.id,
      targetCollections: targetCollections,
      files: files,
      permissions,
      stateDefinition,
      createdAt: now,
    };

    await this.repos.app.insert(app);
    await this.repos.appVersion.insert(appVersion);

    return makeSuccessfulResult(makeApp(app, appVersion));
  }
}
