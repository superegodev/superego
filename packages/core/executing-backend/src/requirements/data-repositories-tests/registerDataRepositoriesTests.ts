import type Dependencies from "./Dependencies.js";
import backgroundJobs from "./suites/background-jobs.js";
import collectionCategories from "./suites/collection-categories.js";
import collectionVersions from "./suites/collection-versions.js";
import collections from "./suites/collections.js";
import conversations from "./suites/conversations.js";
import documentVersions from "./suites/document-versions.js";
import documents from "./suites/documents.js";
import files from "./suites/files.js";
import globalSettings from "./suites/global-settings.js";
import transactions from "./suites/transactions.js";

export type { default as Dependencies } from "./Dependencies.js";

export default function registerDataRepositoriesTests(
  deps: () => Promise<Dependencies>,
) {
  collectionCategories(deps);
  collections(deps);
  collectionVersions(deps);
  documents(deps);
  documentVersions(deps);
  files(deps);
  conversations(deps);
  backgroundJobs(deps);
  globalSettings(deps);
  transactions(deps);
}
