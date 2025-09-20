import type { Data } from "@superego/demo-data-repositories";
import { Finance } from "./collectionCategories.js";
import expenses from "./expenses.js";

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
  },
  collections: {},
  collectionVersions: {},
  documents: {},
  documentVersions: {},
};

for (const { collection, collectionVersion, documents, documentVersions } of [
  expenses,
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
