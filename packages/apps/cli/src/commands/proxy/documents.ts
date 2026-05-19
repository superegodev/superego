import { readFile } from "node:fs/promises";
import type { CollectionId, DocumentId } from "@superego/backend";
import { Command } from "commander";
import { createCliBackend } from "../shared/backend.js";
import { readJsonInput } from "../shared/json.js";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import { runCommand } from "../shared/results.js";
import createProxyDomainCommand from "./createProxyDomainCommand.js";

const documents = createProxyDomainCommand("documents", "Manage documents", [
  {
    name: "create",
    description: "Create a document",
    argumentCount: 1,
    getCall: (backend) => backend.documents.create,
  },
  {
    name: "create-many",
    description: "Create multiple documents",
    argumentCount: 1,
    getCall: (backend) => backend.documents.createMany,
  },
  {
    name: "create-new-version",
    description: "Create a new document version",
    argumentCount: 4,
    getCall: (backend) => backend.documents.createNewVersion,
  },
  {
    name: "delete",
    description: "Delete a document",
    argumentCount: 2,
    getCall: (backend) => (collectionId: string, documentId: string) =>
      backend.documents.delete(
        collectionId as CollectionId,
        documentId as DocumentId,
        "delete",
      ),
  },
  {
    name: "list",
    description: "List documents in a collection",
    argumentCount: 1,
    getCall: (backend) => backend.documents.list,
  },
  {
    name: "list-versions",
    description: "List document versions",
    argumentCount: 2,
    getCall: (backend) => backend.documents.listVersions,
  },
  {
    name: "get",
    description: "Get a document",
    argumentCount: 2,
    getCall: (backend) => backend.documents.get,
  },
  {
    name: "get-version",
    description: "Get a document version",
    argumentCount: 3,
    getCall: (backend) => backend.documents.getVersion,
  },
  {
    name: "search",
    description: "Search documents",
    argumentCount: 3,
    getCall: (backend) => backend.documents.search,
  },
]);

documents.addCommand(
  useMarkdownHelp(
    new Command("execute-typescript-function")
      .description(
        "Run a synchronous TypeScript function over collection documents",
      )
      .option(
        "--collection <collectionId>",
        "Target collection id",
        collectString,
        [],
      )
      .option("--function <path>", "TypeScript function source path")
      .option(
        "-i, --input <path>",
        "JSON input file. Use - to read JSON from stdin.",
      )
      .action(
        async (options: {
          collection: CollectionId[];
          function?: string;
          input?: string;
        }) => {
          await runCommand(async () => {
            const input = await readExecuteTypescriptFunctionInput(options);
            return (
              await createCliBackend()
            ).documents.executeTypescriptFunction(
              input.collectionIds,
              input.typescriptFunction,
            );
          });
        },
      ),
    {
      outputShape: '{ "success": true, "data": ... }',
      sideEffects: ["None."],
      failureCases: [
        "Collection id does not exist.",
        "TypeScript compilation fails.",
        "Function execution fails.",
      ],
      notes: [
        "Use repeated `--collection Collection_...` plus `--function main.ts`.",
        'Alternatively pass `--input <path|->` with `{ "collectionIds": [], "typescriptFunction": "..." }`.',
      ],
    },
  ),
);

function collectString(
  value: string,
  previous: CollectionId[],
): CollectionId[] {
  return [...previous, value as CollectionId];
}

async function readExecuteTypescriptFunctionInput(options: {
  collection: CollectionId[];
  function?: string;
  input?: string;
}): Promise<{ collectionIds: CollectionId[]; typescriptFunction: string }> {
  if (options.input) {
    const input = await readJsonInput(options.input);
    if (isExecuteTypescriptFunctionInput(input)) {
      return input;
    }
    throw new Error("Invalid execute-typescript-function input.");
  }
  if (options.collection.length === 0 || !options.function) {
    throw new Error("Pass --collection and --function, or pass --input.");
  }
  return {
    collectionIds: options.collection,
    typescriptFunction: await readFile(options.function, "utf-8"),
  };
}

function isExecuteTypescriptFunctionInput(
  input: unknown,
): input is { collectionIds: CollectionId[]; typescriptFunction: string } {
  return (
    typeof input === "object" &&
    input !== null &&
    "collectionIds" in input &&
    Array.isArray(input.collectionIds) &&
    input.collectionIds.every(
      (collectionId) => typeof collectionId === "string",
    ) &&
    "typescriptFunction" in input &&
    typeof input.typescriptFunction === "string"
  );
}

export default documents;
