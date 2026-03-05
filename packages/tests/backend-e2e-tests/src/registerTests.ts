import type GetDependencies from "./GetDependencies.js";
import apps from "./suites/apps.js";
import assistants from "./suites/assistants.js";
import backgroundJobs from "./suites/background-jobs.js";
import bazaar from "./suites/bazaar.js";
import collectionCategories from "./suites/collection-categories.js";
import collections from "./suites/collections.js";
import database from "./suites/database.js";
import documents from "./suites/documents.js";
import files from "./suites/files.js";
import globalSettings from "./suites/global-settings.js";
import inference from "./suites/inference.js";
import packs from "./suites/packs.js";

export default function registerTests(deps: GetDependencies) {
  apps(deps);
  assistants(deps);
  backgroundJobs(deps);
  bazaar(deps);
  collectionCategories(deps);
  collections(deps);
  database(deps);
  documents(deps);
  files(deps);
  globalSettings(deps);
  inference(deps);
  packs(deps);
}
