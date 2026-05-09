import { appsContracts } from "./domains/appsContracts.js";
import { assistantsContracts } from "./domains/assistantsContracts.js";
import { backgroundJobsContracts } from "./domains/backgroundJobsContracts.js";
import { boutiqueContracts } from "./domains/boutiqueContracts.js";
import { collectionCategoriesContracts } from "./domains/collectionCategoriesContracts.js";
import { collectionsContracts } from "./domains/collectionsContracts.js";
import { databaseContracts } from "./domains/databaseContracts.js";
import { documentsContracts } from "./domains/documentsContracts.js";
import { filesContracts } from "./domains/filesContracts.js";
import { globalSettingsContracts } from "./domains/globalSettingsContracts.js";
import { inferenceContracts } from "./domains/inferenceContracts.js";
import { packsContracts } from "./domains/packsContracts.js";

export const backendContracts = {
  collectionCategories: collectionCategoriesContracts,
  collections: collectionsContracts,
  documents: documentsContracts,
  files: filesContracts,
  assistants: assistantsContracts,
  inference: inferenceContracts,
  apps: appsContracts,
  packs: packsContracts,
  boutique: boutiqueContracts,
  backgroundJobs: backgroundJobsContracts,
  globalSettings: globalSettingsContracts,
  database: databaseContracts,
} as const;
