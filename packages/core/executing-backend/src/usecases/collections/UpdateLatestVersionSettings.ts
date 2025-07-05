import type {
  Backend,
  Collection,
  CollectionId,
  CollectionNotFound,
  CollectionSummaryPropertiesNotValid,
  CollectionVersionId,
  CollectionVersionIdNotMatching,
  CollectionVersionSettings,
  RpcResultPromise,
} from "@superego/backend";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
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
  ): RpcResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionVersionIdNotMatching
    | CollectionSummaryPropertiesNotValid
  > {
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionNotFound", { collectionId: id }),
      );
    }

    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestVersion);
    if (latestVersionId !== latestVersion.id) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionVersionIdNotMatching", {
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
        return makeUnsuccessfulRpcResult(
          makeRpcError("CollectionSummaryPropertiesNotValid", {
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

    return makeSuccessfulRpcResult(makeCollection(collection, updatedVersion));
  }
}
