import type {
  Backend,
  Collection,
  CollectionCategoryNotFound,
  CollectionId,
  CollectionNotFound,
  CollectionSettings,
  CollectionSettingsNotValid,
  RpcResultPromise,
} from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsUpdateSettings extends Usecase<
  Backend["collections"]["updateSettings"]
> {
  async exec(
    id: CollectionId,
    settingsPatch: Partial<CollectionSettings>,
  ): RpcResultPromise<
    Collection,
    CollectionNotFound | CollectionSettingsNotValid | CollectionCategoryNotFound
  > {
    const collection = await this.repos.collection.find(id);

    if (!collection) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionNotFound", { collectionId: id }),
      );
    }

    const settingsValidationResult = v.safeParse(
      v.partial(
        v.object({
          name: valibotSchemas.collectionName(),
          icon: v.nullable(valibotSchemas.icon()),
          description: v.nullable(v.string()),
          assistantInstructions: v.nullable(v.string()),
        }),
      ),
      settingsPatch,
    );

    if (!settingsValidationResult.success) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionSettingsNotValid", {
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
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionCategoryNotFound", {
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
          settingsPatch.collectionCategoryId !== undefined
            ? settingsPatch.collectionCategoryId
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

    return makeSuccessfulRpcResult(
      makeCollection(updatedCollection, latestVersion),
    );
  }
}
