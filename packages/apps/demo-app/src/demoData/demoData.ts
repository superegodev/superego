import type { Data } from "@superego/demo-data-repositories";
import { Finance, Health } from "./collectionCategories.js";
import expenses from "./expenses.js";
import weighIns from "./weighIns.js";

const demoData: Pick<
  Data,
  | "collectionCategories"
  | "collections"
  | "collectionVersions"
  | "documents"
  | "documentVersions"
> = {
  collectionCategories: {
    [Finance.id]: Finance,
    [Health.id]: Health,
  },
  collections: {},
  collectionVersions: {},
  documents: {},
  documentVersions: {},
};

for (const { collection, collectionVersion, documents, documentVersions } of [
  expenses,
  weighIns,
]) {
  demoData.collections[collection.id] = collection;
  demoData.collectionVersions[collectionVersion.id] = collectionVersion;
  for (const document of documents) {
    demoData.documents[document.id] = document;
  }
  for (const documentVersion of documentVersions) {
    demoData.documentVersions[documentVersion.id] = documentVersion;
  }
}

export default demoData;
