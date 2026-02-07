// TODO_BAZAAR: review this file
import type {
  App,
  AppVersion,
  Backend,
  Collection,
  CollectionId,
  CollectionVersionId,
  DocumentDefinition,
  Pack,
} from "@superego/backend";
import packs from "@superego/bazaar";
import { Id } from "@superego/shared-utils";
import calendarEntriesData from "./calendarEntriesData.js";
import contactsData from "./contactsData.js";
import expensesData from "./expensesData.js";
import foodsData from "./foodsData.js";
import fuelLogsData from "./fuelLogsData.js";
import mealsData from "./mealsData.js";
import weighInsData from "./weighInsData.js";

export type LoadDemoDataProgress = {
  current: number;
  total: number;
  message: string;
};

const documentsByCollectionName = new Map<string, unknown[]>([
  ["Calendar", calendarEntriesData],
  ["Contacts", contactsData],
  ["Expenses", expensesData],
  ["Foods", foodsData],
  ["Fuel Logs", fuelLogsData],
  ["Meals", mealsData],
  ["Weigh-ins", weighInsData],
]);

export default async function loadDemoData(
  backend: Backend,
  onProgress: (progress: LoadDemoDataProgress) => void,
): Promise<void> {
  validateDocumentSourcesForPacks(packs, documentsByCollectionName);

  const totalPacks = packs.length;

  onProgress({
    current: 0,
    total: totalPacks,
    message: "Installing demo packs",
  });

  for (const [packIndex, pack] of packs.entries()) {
    const currentPackNumber = packIndex + 1;
    onProgress({
      current: packIndex,
      total: totalPacks,
      message: `Installing pack ${currentPackNumber} of ${totalPacks}: ${pack.info.name}`,
    });

    const packWithDocuments: Pack = {
      ...pack,
      documents: [...pack.documents, ...makePackDocuments(pack)],
    };

    const installPackResult =
      await backend.bazaar.installPack(packWithDocuments);
    if (!installPackResult.success) {
      throw new Error(
        `Failed to install pack ${pack.id}: ${JSON.stringify(installPackResult.error)}`,
      );
    }
    await patchInstalledAppsWithResolvedCollectionIds(
      backend,
      pack,
      installPackResult.data.collections,
      installPackResult.data.apps,
    );

    onProgress({
      current: currentPackNumber,
      total: totalPacks,
      message: `Installed pack ${currentPackNumber} of ${totalPacks}: ${pack.info.name}`,
    });
  }
}

function makePackDocuments(pack: Pack): DocumentDefinition<true>[] {
  const documents: DocumentDefinition<true>[] = [];
  for (const [collectionIndex, collection] of pack.collections.entries()) {
    const collectionDocuments = documentsByCollectionName.get(
      collection.settings.name,
    );
    if (!collectionDocuments) {
      throw new Error(
        `Missing demo documents for collection "${collection.settings.name}" in pack ${pack.id}`,
      );
    }

    for (const content of collectionDocuments) {
      documents.push({
        collectionId: Id.generate.protoCollection(collectionIndex),
        content,
      });
    }
  }
  return documents;
}

function validateDocumentSourcesForPacks(
  packList: Pack[],
  documentSourcesByCollectionName: Map<string, unknown[]>,
): void {
  const collectionNames = packList.flatMap((pack) =>
    pack.collections.map((collection) => collection.settings.name),
  );
  const duplicateCollectionNames = getDuplicateValues(collectionNames);
  if (duplicateCollectionNames.length > 0) {
    throw new Error(
      `Duplicate collection names across packs are not supported: ${duplicateCollectionNames.join(", ")}`,
    );
  }

  const collectionNameSet = new Set(collectionNames);
  const missingDocumentSources = collectionNames.filter(
    (collectionName) => !documentSourcesByCollectionName.has(collectionName),
  );
  const extraDocumentSources = Array.from(
    documentSourcesByCollectionName.keys(),
  )
    .filter((collectionName) => !collectionNameSet.has(collectionName))
    .sort();

  if (missingDocumentSources.length > 0 || extraDocumentSources.length > 0) {
    const missingSourcesMessage =
      missingDocumentSources.length > 0
        ? `Missing sources for: ${missingDocumentSources.join(", ")}`
        : "Missing sources for: none";
    const extraSourcesMessage =
      extraDocumentSources.length > 0
        ? `Extra sources for: ${extraDocumentSources.join(", ")}`
        : "Extra sources for: none";

    throw new Error(
      `Demo documents mapping does not match bazaar collections. ${missingSourcesMessage}. ${extraSourcesMessage}.`,
    );
  }
}

function getDuplicateValues(values: string[]): string[] {
  const duplicateValues = new Set<string>();
  const seenValues = new Set<string>();
  for (const value of values) {
    if (seenValues.has(value)) {
      duplicateValues.add(value);
      continue;
    }
    seenValues.add(value);
  }
  return Array.from(duplicateValues).sort();
}

async function patchInstalledAppsWithResolvedCollectionIds(
  backend: Backend,
  pack: Pack,
  createdCollections: Collection[],
  createdApps: App[],
): Promise<void> {
  if (pack.apps.length === 0) {
    return;
  }

  const collectionIdByProtoCollectionId = new Map<
    string,
    { collectionId: CollectionId; collectionVersionId: CollectionVersionId }
  >(
    createdCollections.map((collection, index) => [
      Id.generate.protoCollection(index),
      {
        collectionId: collection.id,
        collectionVersionId: collection.latestVersion.id,
      },
    ]),
  );
  const collectionVersionIdByCollectionId = new Map<
    CollectionId,
    CollectionVersionId
  >(
    createdCollections.map((collection) => [
      collection.id,
      collection.latestVersion.id,
    ]),
  );

  for (const [appIndex, appDefinition] of pack.apps.entries()) {
    const createdApp = createdApps[appIndex];
    if (!createdApp) {
      throw new Error(
        `Installed apps do not match pack apps for pack ${pack.id}. Missing app at index ${appIndex}`,
      );
    }
    if (appDefinition.targetCollectionIds.length !== 1) {
      throw new Error(
        `Expected exactly one target collection for app "${appDefinition.name}" in pack ${pack.id}`,
      );
    }

    const targetCollectionId = appDefinition.targetCollectionIds[0]!;
    const resolvedCollection = Id.is.protoCollection(targetCollectionId)
      ? collectionIdByProtoCollectionId.get(targetCollectionId)
      : {
          collectionId: targetCollectionId as CollectionId,
          collectionVersionId:
            collectionVersionIdByCollectionId.get(
              targetCollectionId as CollectionId,
            ) ?? null,
        };
    if (!resolvedCollection || !resolvedCollection.collectionVersionId) {
      throw new Error(
        `Could not resolve target collection for app "${appDefinition.name}" in pack ${pack.id}`,
      );
    }

    const files = replaceCollectionPlaceholdersInAppFiles(
      appDefinition.files,
      resolvedCollection.collectionId,
      resolvedCollection.collectionVersionId,
    );
    const createNewVersionResult = await backend.apps.createNewVersion(
      createdApp.id,
      [resolvedCollection.collectionId],
      files,
    );
    if (!createNewVersionResult.success) {
      throw new Error(
        `Failed to patch app "${appDefinition.name}" in pack ${pack.id}: ${JSON.stringify(createNewVersionResult.error)}`,
      );
    }
  }
}

function replaceCollectionPlaceholdersInAppFiles(
  files: AppVersion["files"],
  collectionId: CollectionId,
  collectionVersionId: CollectionVersionId,
): AppVersion["files"] {
  return Object.fromEntries(
    Object.entries(files).map(([filePath, fileContent]) => [
      filePath,
      {
        source: fileContent.source
          .replaceAll("$COLLECTION_ID", collectionId)
          .replaceAll("$COLLECTION_VERSION_ID", collectionVersionId),
        compiled: fileContent.compiled
          .replaceAll("$COLLECTION_ID", collectionId)
          .replaceAll("$COLLECTION_VERSION_ID", collectionVersionId),
      },
    ]),
  ) as AppVersion["files"];
}
