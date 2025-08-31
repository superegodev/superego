import type {
  Backend,
  Collection,
  CollectionId,
  CollectionNotFound,
  CollectionSummaryPropertiesNotValid,
  CollectionVersionId,
  CollectionVersionIdNotMatching,
  CollectionVersionSettings,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionUpdateLatestVersionSettings extends Usecase<
  Backend["collections"]["updateLatestVersionSettings"]
> {
  async exec(
    id: CollectionId,
    latestVersionId: CollectionVersionId,
    settingsPatch: Partial<CollectionVersionSettings>,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionVersionIdNotMatching
    | CollectionSummaryPropertiesNotValid
    | UnexpectedError
  > {
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestVersion);
    if (latestVersionId !== latestVersion.id) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionVersionIdNotMatching", {
          collectionId: id,
          latestVersionId: latestVersion.id,
          suppliedVersionId: latestVersionId,
        }),
      );
    }

    if (settingsPatch.summaryProperties) {
      const nonValidSummaryPropertyIndexes = (
        await Promise.all(
          settingsPatch.summaryProperties.map(({ getter }) =>
            this.javascriptSandbox.moduleDefaultExportsFunction(getter),
          ),
        )
      ).reduce<number[]>(
        (indexes, isValid, index) => (isValid ? indexes : [...indexes, index]),
        [],
      );
      if (!isEmpty(nonValidSummaryPropertyIndexes)) {
        return makeUnsuccessfulResult(
          makeResultError("CollectionSummaryPropertiesNotValid", {
            collectionId: id,
            collectionVersionId: latestVersion.id,
            issues: nonValidSummaryPropertyIndexes.map((index) => ({
              // TODO: i18n
              message:
                "The default export of the getter TypescriptModule is not a function",
              path: [{ key: index }, { key: "getter" }],
            })),
          }),
        );
      }
    }

    const updatedVersion: CollectionVersionEntity = {
      ...latestVersion,
      settings: {
        summaryProperties:
          settingsPatch.summaryProperties ??
          latestVersion.settings.summaryProperties,
      },
    };
    await this.repos.collectionVersion.replace(updatedVersion);

    return makeSuccessfulResult(makeCollection(collection, updatedVersion));
  }
}
