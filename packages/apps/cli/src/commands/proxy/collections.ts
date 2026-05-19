import type {
  CollectionId,
  CollectionVersionId,
  CollectionVersionSettings,
  TypescriptModule,
} from "@superego/backend";
import type { Schema } from "@superego/schema";
import { Command } from "commander";
import { createCliBackend } from "../shared/backend.js";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import { runCommand } from "../shared/results.js";
import createProxyDomainCommand from "./createProxyDomainCommand.js";

const collections = createProxyDomainCommand(
  "collections",
  "Manage collections",
  [
    {
      name: "create",
      description: "Create a collection",
      argumentCount: 1,
      getCall: (backend) => backend.collections.create,
    },
    {
      name: "create-many",
      description: "Create multiple collections",
      argumentCount: 1,
      getCall: (backend) => backend.collections.createMany,
    },
    {
      name: "update-settings",
      description: "Update collection settings",
      argumentCount: 2,
      getCall: (backend) => backend.collections.updateSettings,
    },
    {
      name: "create-new-version",
      description: "Create a new local collection version",
      argumentCount: 5,
      getCall: (backend) => createLocalCollectionVersion(backend),
    },
    {
      name: "update-latest-version-settings",
      description: "Update latest collection version settings",
      argumentCount: 3,
      getCall: (backend) => backend.collections.updateLatestVersionSettings,
    },
    {
      name: "delete",
      description: "Delete a collection",
      argumentCount: 1,
      getCall: (backend) => (id: string) =>
        backend.collections.delete(id as CollectionId, "delete"),
    },
    {
      name: "list",
      description: "List collections",
      argumentCount: 0,
      getCall: (backend) => backend.collections.list,
    },
  ],
);

collections.addCommand(
  useMarkdownHelp(
    new Command("get-typescript-schema")
      .description("Get a collection TypeScript schema")
      .argument("<collectionId>", "Collection id")
      .action(async (collectionId: CollectionId) => {
        await runCommand(async () =>
          (await createCliBackend()).collections.getTypescriptSchema(
            collectionId,
          ),
        );
      }),
    {
      outputShape:
        '{ "success": true, "data": { "typescriptSchema": "..." }, "error": null }',
      sideEffects: ["None."],
      failureCases: ["Collection id does not exist."],
      relatedCommands: ["superego collections list"],
    },
  ),
);

type CliBackend = Awaited<ReturnType<typeof createCliBackend>>;

function createLocalCollectionVersion(backend: CliBackend) {
  return (
    id: CollectionId,
    latestVersionId: CollectionVersionId,
    schema: Schema,
    settings: CollectionVersionSettings,
    migration: TypescriptModule | null,
  ) =>
    backend.collections.createNewVersion(
      id,
      latestVersionId,
      schema,
      settings,
      migration,
      null,
    );
}

export default collections;
