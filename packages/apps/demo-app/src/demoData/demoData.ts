import type { Data } from "@superego/demo-data-repositories";
import calendarEntries from "./calendarEntries.js";
import { Car, Finance, Health } from "./collectionCategories.js";
import contacts from "./contacts.js";
import expenses from "./expenses.js";
import fuelLogs from "./fuelLogs.js";
import weighIns from "./weighIns.js";

const demoData: Pick<
  Data,
  | "collectionCategories"
  | "collections"
  | "collectionVersions"
  | "documents"
  | "documentVersions"
  | "apps"
  | "appVersions"
> = {
  collectionCategories: {
    [Car.id]: Car,
    [Finance.id]: Finance,
    [Health.id]: Health,
  },
  collections: {},
  collectionVersions: {},
  documents: {},
  documentVersions: {},
  apps: {},
  appVersions: {},
};

for (const {
  collection,
  collectionVersion,
  documents,
  documentVersions,
  app,
  appVersion,
} of [calendarEntries, contacts, expenses, fuelLogs, weighIns]) {
  demoData.collections[collection.id] = collection;
  demoData.collectionVersions[collectionVersion.id] = collectionVersion;
  for (const document of documents) {
    demoData.documents[document.id] = document;
  }
  for (const documentVersion of documentVersions) {
    demoData.documentVersions[documentVersion.id] = documentVersion;
  }
  if (app) {
    demoData.apps[app.id] = app;
  }
  if (appVersion) {
    demoData.appVersions[appVersion.id] = appVersion;
  }
}

export default demoData;
