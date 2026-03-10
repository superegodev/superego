import type {
  Backend,
  DocumentDefinition,
  Pack,
  ProtoCollectionId,
} from "@superego/backend";
import { packs } from "@superego/boutique";
import calendarEntriesData from "./calendarEntriesData.js";
import contactsData from "./contactsData.js";
import expensesData from "./expensesData.js";
import foodsData from "./foodsData.js";
import fuelLogsData from "./fuelLogsData.js";
import mealsData from "./mealsData.js";
import weighInsData from "./weighInsData.js";

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
      ...makeDocuments("ProtoCollection_1", foodsData),
      ...makeDocuments("ProtoCollection_2", mealsData),
      ...makeDocuments("ProtoCollection_3", weighInsData),
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

export default async function loadDemoData(backend: Backend): Promise<void> {
  for (const pack of packsWithDocuments) {
    const installPackResult = await backend.packs.install(pack);
    if (!installPackResult.success) {
      // Just log the error and move on.
      console.error(
        `Failed to install pack ${pack.id}`,
        installPackResult.error,
      );
    }
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
