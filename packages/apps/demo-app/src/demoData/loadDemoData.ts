import type {
  Backend,
  DocumentDefinition,
  Pack,
  ProtoCollectionId,
} from "@superego/backend";
import { packs } from "@superego/bazaar";
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
};

const packsWithDocuments = [
  {
    ...packs[0]!,
    documents: [
      ...packs[0]!.documents,
      ...makeDocuments("ProtoCollection_0", fuelLogsData),
    ],
  },
  {
    ...packs[1]!,
    documents: [
      ...packs[1]!.documents,
      ...makeDocuments("ProtoCollection_0", foodsData),
      ...makeDocuments("ProtoCollection_1", mealsData),
      ...makeDocuments("ProtoCollection_2", weighInsData),
    ],
  },
  {
    ...packs[2]!,
    documents: [
      ...packs[2]!.documents,
      ...makeDocuments("ProtoCollection_0", expensesData),
    ],
  },
  {
    ...packs[3]!,
    documents: [
      ...packs[3]!.documents,
      ...makeDocuments("ProtoCollection_0", contactsData),
      ...makeDocuments("ProtoCollection_1", calendarEntriesData),
    ],
  },
] as const satisfies Pack[];

export default async function loadDemoData(
  backend: Backend,
  onProgress: (progress: LoadDemoDataProgress) => void,
): Promise<void> {
  const totalPacks = packsWithDocuments.length;

  onProgress({
    current: 0,
    total: totalPacks,
  });

  for (const [packIndex, pack] of packsWithDocuments.entries()) {
    const currentPackNumber = packIndex + 1;
    onProgress({
      current: packIndex,
      total: totalPacks,
    });

    const installPackResult = await backend.packs.installPack(pack);
    if (!installPackResult.success) {
      throw new Error(
        `Failed to install pack ${pack.id}: ${JSON.stringify(installPackResult.error)}`,
      );
    }

    onProgress({
      current: currentPackNumber,
      total: totalPacks,
    });
  }
}

function makeDocuments(
  collectionId: ProtoCollectionId,
  contents: readonly unknown[],
): DocumentDefinition<true>[] {
  return contents.map((content) => ({
    collectionId,
    content,
  }));
}
