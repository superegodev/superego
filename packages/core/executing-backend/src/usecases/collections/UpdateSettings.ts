import type {
  AppNotFound,
  Backend,
  Collection,
  CollectionCategoryNotFound,
  CollectionId,
  CollectionNotFound,
  CollectionSettings,
  CollectionSettingsNotValid,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import { collection as collectionDomainSchema } from "../../validation/domain/collection.js";
import {
  appNotFound,
  collectionCategoryNotFound,
  collectionNotFound,
  collectionSettingsNotValid,
  unexpectedError,
} from "../../validation/errors.js";
import { collectionId as collectionIdSchema } from "../../validation/helpers/idSchemas.js";
import looseObjectAs from "../../validation/helpers/looseObjectAs.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class CollectionsUpdateSettings extends BackendUsecase<
  Backend["collections"]["updateSettings"]
> {
  argumentsSchema = v.tuple([
    collectionIdSchema(),
    looseObjectAs<Partial<CollectionSettings>>(),
  ]);
  resultSchema = makeResultSchema(collectionDomainSchema(), [
    appNotFound(),
    collectionCategoryNotFound(),
    collectionNotFound(),
    collectionSettingsNotValid(),
    unexpectedError(),
  ]);

  async exec(
    id: CollectionId,
    settingsPatch: Partial<CollectionSettings>,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionSettingsNotValid
    | CollectionCategoryNotFound
    | AppNotFound
    | UnexpectedError
  > {
    const collection = await this.repos.collection.find(id);

    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

    const settingsValidationResult = v.safeParse(
      v.partial(
        v.object({
          name: valibotSchemas.collectionName(),
          icon: v.nullable(valibotSchemas.icon()),
          collectionCategoryId: v.nullable(
            valibotSchemas.id.collectionCategory(),
          ),
          defaultCollectionViewAppId: v.nullable(valibotSchemas.id.app()),
          description: v.nullable(v.string()),
          assistantInstructions: v.nullable(v.string()),
          redirectToCollectionAfterDocumentCreation: v.boolean(),
        }),
      ),
      settingsPatch,
    );

    if (!settingsValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionSettingsNotValid", {
          collectionId: id,
          issues: makeValidationIssues(settingsValidationResult.issues),
        }),
      );
    }

    if (
      settingsPatch.collectionCategoryId &&
      !(await this.repos.collectionCategory.exists(
        settingsPatch.collectionCategoryId,
      ))
    ) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionCategoryNotFound", {
          collectionCategoryId: settingsPatch.collectionCategoryId,
        }),
      );
    }

    if (
      settingsPatch.defaultCollectionViewAppId &&
      !(await this.repos.app.exists(settingsPatch.defaultCollectionViewAppId))
    ) {
      return makeUnsuccessfulResult(
        makeResultError("AppNotFound", {
          appId: settingsPatch.defaultCollectionViewAppId,
        }),
      );
    }

    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestVersion);

    const updatedCollection: CollectionEntity = {
      ...collection,
      settings: {
        name: settingsValidationResult.output.name ?? collection.settings.name,
        icon:
          settingsValidationResult.output.icon !== undefined
            ? settingsValidationResult.output.icon
            : collection.settings.icon,
        collectionCategoryId:
          settingsValidationResult.output.collectionCategoryId !== undefined
            ? settingsValidationResult.output.collectionCategoryId
            : collection.settings.collectionCategoryId,
        defaultCollectionViewAppId:
          settingsValidationResult.output.defaultCollectionViewAppId !==
          undefined
            ? settingsValidationResult.output.defaultCollectionViewAppId
            : collection.settings.defaultCollectionViewAppId,
        description:
          settingsPatch.description !== undefined
            ? settingsPatch.description
            : collection.settings.description,
        assistantInstructions:
          settingsPatch.assistantInstructions !== undefined
            ? settingsPatch.assistantInstructions
            : collection.settings.assistantInstructions,
        redirectToCollectionAfterDocumentCreation:
          settingsPatch.redirectToCollectionAfterDocumentCreation !== undefined
            ? settingsPatch.redirectToCollectionAfterDocumentCreation
            : collection.settings.redirectToCollectionAfterDocumentCreation,
      },
    };
    await this.repos.collection.replace(updatedCollection);

    return makeSuccessfulResult(
      makeCollection(
        updatedCollection,
        latestVersion,
        this.getConnector(updatedCollection),
      ),
    );
  }
}
