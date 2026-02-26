import type GetDependencies from "./GetDependencies.js";
import apps from "./suites/apps.js";
import assistants from "./suites/assistants.js";
import backgroundJobs from "./suites/background-jobs.js";
import bazaar from "./suites/bazaar.js";
import collectionCategories from "./suites/collection-categories.js";
import collections from "./suites/collections.js";
import documents from "./suites/documents.js";
import files from "./suites/files.js";
import globalSettings from "./suites/global-settings.js";
import packs from "./suites/packs.js";

export default function registerTests(deps: GetDependencies) {
  apps(deps);
  assistants(deps);
  backgroundJobs(deps);
  bazaar(deps);
  collectionCategories(deps);
  collections(deps);
  documents(deps);
  files(deps);
  globalSettings(deps);
  packs(deps);
}
