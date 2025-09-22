import type {
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
import { valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsUpdateSettings extends Usecase<
  Backend["collections"]["updateSettings"]
> {
  async exec(
    id: CollectionId,
    settingsPatch: Partial<CollectionSettings>,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionSettingsNotValid
    | CollectionCategoryNotFound
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
          description: v.nullable(v.string()),
          assistantInstructions: v.nullable(v.string()),
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
        description:
          settingsPatch.description !== undefined
            ? settingsPatch.description
            : collection.settings.description,
        assistantInstructions:
          settingsPatch.assistantInstructions !== undefined
            ? settingsPatch.assistantInstructions
            : collection.settings.assistantInstructions,
      },
    };
    await this.repos.collection.replace(updatedCollection);

    return makeSuccessfulResult(
      makeCollection(updatedCollection, latestVersion),
    );
  }
}
