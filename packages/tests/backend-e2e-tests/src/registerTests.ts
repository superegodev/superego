import type GetDependencies from "./GetDependencies.js";
import apps from "./suites/apps.js";
import backgroundJobs from "./suites/background-jobs.js";
import collectionCategories from "./suites/collection-categories.js";
import collections from "./suites/collections.js";
import documents from "./suites/documents.js";
import files from "./suites/files.js";
import globalSettings from "./suites/global-settings.js";

export default function registerTests(deps: GetDependencies) {
  collectionCategories(deps);
  collections(deps);
  documents(deps);
  files(deps);
  apps(deps);
  backgroundJobs(deps);
  globalSettings(deps);
}
