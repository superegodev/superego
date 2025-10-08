import type {
  Backend,
  Collection,
  CollectionId,
  CollectionNotFound,
  CollectionVersionId,
  CollectionVersionIdNotMatching,
  CollectionVersionSettings,
  ContentSummaryGetterNotValid,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
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
    | ContentSummaryGetterNotValid
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

    if (settingsPatch.contentSummaryGetter) {
      const isContentSummaryGetterValid =
        await this.javascriptSandbox.moduleDefaultExportsFunction(
          settingsPatch.contentSummaryGetter,
        );
      if (!isContentSummaryGetterValid) {
        return makeUnsuccessfulResult(
          makeResultError("ContentSummaryGetterNotValid", {
            collectionId: null,
            collectionVersionId: null,
            issues: [
              {
                message:
                  "The default export of the contentSummaryGetter TypescriptModule is not a function",
              },
            ],
          }),
        );
      }
    }

    const updatedVersion: CollectionVersionEntity = {
      ...latestVersion,
      settings: {
        contentSummaryGetter:
          settingsPatch.contentSummaryGetter ??
          latestVersion.settings.contentSummaryGetter,
      },
    };
    await this.repos.collectionVersion.replace(updatedVersion);

    return makeSuccessfulResult(
      makeCollection(collection, updatedVersion, this.getConnector(collection)),
    );
  }
}
