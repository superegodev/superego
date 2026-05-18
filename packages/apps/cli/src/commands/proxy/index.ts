import { readFile } from "node:fs/promises";
import { type CollectionId } from "@superego/backend";
import LocalInstantTypeDeclaration from "@superego/javascript-sandbox-global-utils/LocalInstant.d.ts?raw";
import {
  DataType,
  FormatId,
  type Schema,
  type AnyTypeDefinition,
  codegen,
  utils as schemaUtils,
} from "@superego/schema";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { Command } from "commander";
import { DateTime } from "luxon";
import { createCliBackend } from "../shared/backend.js";
import { readJsonInput } from "../shared/json.js";
import { useMarkdownHelp } from "../shared/markdownHelp.js";
import { runCommand } from "../shared/results.js";

type CliBackend = Awaited<ReturnType<typeof createCliBackend>>;
type BackendCall = (backend: CliBackend) => (...args: any[]) => Promise<any>;

interface ProxyCommandDefinition {
  name: string;
  description: string;
  argumentCount: number;
  getCall: BackendCall;
}

export function createProxyDomainCommand(
  name: string,
  description: string,
  definitions: ProxyCommandDefinition[],
): Command {
  const domain = useMarkdownHelp(new Command(name).description(description), {
    outputShape:
      '{ "success": true, "data": ... } | { "success": false, "error": ... }',
    notes: [
      "Proxy commands print backend Result JSON.",
      "Use command help for argument input shape.",
    ],
  });

  for (const definition of definitions) {
    domain.addCommand(createProxyCommand(definition));
  }

  return domain;
}

function createProxyCommand(definition: ProxyCommandDefinition): Command {
  const command = useMarkdownHelp(
    new Command(definition.name)
      .description(definition.description)
      .option(
        "-i, --input <path>",
        "JSON input file. Use - to read JSON from stdin.",
      ),
    {
      outputShape:
        '{ "success": true, "data": ... } | { "success": false, "error": ... }',
      sideEffects:
        definition.name === "list" || definition.name.startsWith("get")
          ? ["None."]
          : ["May mutate the default local Superego database."],
      failureCases: [
        "JSON input missing or invalid.",
        "Backend arguments invalid.",
        "Backend usecase-specific failure.",
      ],
      notes: [
        definition.argumentCount === 0
          ? "Takes no JSON input."
          : definition.argumentCount === 1
            ? "JSON input is the single backend argument value."
            : `JSON input is an array of ${definition.argumentCount} backend arguments.`,
      ],
    },
  );

  command.action(async (options: { input?: string }) => {
    await runCommand(async () => {
      const args = await readProxyArgs(definition.argumentCount, options.input);
      const backend = await createCliBackend();
      return definition.getCall(backend)(...args);
    });
  });

  return command;
}

async function readProxyArgs(
  argumentCount: number,
  inputPath: string | undefined,
): Promise<unknown[]> {
  if (argumentCount === 0) {
    return [];
  }
  const input = await readJsonInput(inputPath);
  if (argumentCount === 1) {
    return [input];
  }
  if (!Array.isArray(input) || input.length !== argumentCount) {
    throw new Error(`Expected JSON array with ${argumentCount} items.`);
  }
  return input;
}

export const collectionCategories = createProxyDomainCommand(
  "collection-categories",
  "Manage collection categories",
  [
    {
      name: "create",
      description: "Create a collection category",
      argumentCount: 1,
      getCall: (backend) => backend.collectionCategories.create,
    },
    {
      name: "update",
      description: "Update a collection category",
      argumentCount: 2,
      getCall: (backend) => backend.collectionCategories.update,
    },
    {
      name: "delete",
      description: "Delete a collection category",
      argumentCount: 1,
      getCall: (backend) => backend.collectionCategories.delete,
    },
    {
      name: "list",
      description: "List collection categories",
      argumentCount: 0,
      getCall: (backend) => backend.collectionCategories.list,
    },
  ],
);

export const collections = createProxyDomainCommand(
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
      description: "Create a new collection version",
      argumentCount: 5,
      getCall: (backend) => backend.collections.createNewVersion,
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
        backend.collections.delete(id as any, "delete"),
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
      .action(async (collectionId: string) => {
        await runCommand(async () => {
          const backend = await createCliBackend();
          const result = await backend.collections.list();
          if (!result.success) {
            return result;
          }
          const collection = result.data.find(
            (candidate) => candidate.id === collectionId,
          );
          if (!collection) {
            return {
              success: false,
              data: null,
              error: {
                name: "CollectionNotFound",
                details: { collectionId },
              },
            };
          }
          return {
            success: true,
            data: {
              typescriptSchema: codegen(collection.latestVersion.schema),
            },
            error: null,
          };
        });
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

export const documents = createProxyDomainCommand(
  "documents",
  "Manage documents",
  [
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
          collectionId as any,
          documentId as any,
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
  ],
);

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
          collection: string[];
          function?: string;
          input?: string;
        }) => {
          await runCommand(async () => {
            const input = await readExecuteTypescriptFunctionInput(options);
            const backend = await createCliBackend();
            const collectionsResult = await backend.collections.list();
            if (!collectionsResult.success) {
              return collectionsResult;
            }
            const uniqueCollectionIds = [...new Set(input.collectionIds)];
            const collectionsById = new Map(
              collectionsResult.data.map((collection) => [
                collection.id,
                collection,
              ]),
            );
            const missingCollectionId = uniqueCollectionIds.find(
              (collectionId) =>
                !collectionsById.has(collectionId as CollectionId),
            );
            if (missingCollectionId) {
              return {
                success: false,
                data: null,
                error: {
                  name: "CollectionNotFound",
                  details: { collectionId: missingCollectionId },
                },
              };
            }

            const compileResult = await new TscTypescriptCompiler().compile(
              { path: "/main.ts", source: input.typescriptFunction },
              [
                ...uniqueCollectionIds.map((collectionId) => ({
                  path: `/${collectionId}.ts` as const,
                  source: codegen(
                    collectionsById.get(collectionId as CollectionId)!
                      .latestVersion.schema,
                  ),
                })),
                {
                  path: "/LocalInstant.d.ts",
                  source: LocalInstantTypeDeclaration,
                },
              ],
            );
            if (!compileResult.success) {
              return compileResult;
            }

            const documentsByCollection: Record<string, unknown[]> = {};
            for (const collectionId of uniqueCollectionIds) {
              const documentsResult = await backend.documents.list(
                collectionId as any,
                false,
              );
              if (!documentsResult.success) {
                return documentsResult;
              }
              const collection = collectionsById.get(
                collectionId as CollectionId,
              )!;
              documentsByCollection[collectionId] = documentsResult.data.map(
                (document) =>
                  toFunctionDocument(
                    collection.latestVersion.schema,
                    document as any,
                    DateTime.local().zoneName,
                  ),
              );
            }

            const { QuickjsJavascriptSandbox } =
              await import("@superego/quickjs-javascript-sandbox/nodejs");
            return new QuickjsJavascriptSandbox().executeSyncFunction(
              { source: "", compiled: compileResult.data },
              [documentsByCollection],
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

export const files = createProxyDomainCommand("files", "Manage files", [
  {
    name: "get-content",
    description: "Get file content",
    argumentCount: 1,
    getCall: (backend) => backend.files.getContent,
  },
]);

function collectString(value: string, previous: string[]): string[] {
  return [...previous, value];
}

async function readExecuteTypescriptFunctionInput(options: {
  collection: string[];
  function?: string;
  input?: string;
}): Promise<{ collectionIds: string[]; typescriptFunction: string }> {
  if (options.input) {
    const input = await readJsonInput(options.input);
    if (
      typeof input === "object" &&
      input !== null &&
      "collectionIds" in input &&
      Array.isArray(input.collectionIds) &&
      input.collectionIds.every(
        (collectionId) => typeof collectionId === "string",
      ) &&
      "typescriptFunction" in input &&
      typeof input.typescriptFunction === "string"
    ) {
      return {
        collectionIds: input.collectionIds,
        typescriptFunction: input.typescriptFunction,
      };
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

function toFunctionDocument(
  schema: Schema,
  document: {
    id: string;
    latestVersion: { id: string; content: unknown };
  },
  timeZone: string,
): unknown {
  return {
    id: document.id,
    versionId: document.latestVersion.id,
    content: toFunctionContent(
      schema,
      document.latestVersion.content,
      timeZone,
    ),
  };
}

function toFunctionContent(
  schema: Schema,
  content: unknown,
  timeZone: string,
): unknown {
  return toFunctionValue(
    schema,
    content,
    schemaUtils.getRootType(schema),
    timeZone,
  );
}

function toFunctionValue(
  schema: Schema,
  value: any,
  typeDefinition: AnyTypeDefinition,
  timeZone: string,
): unknown {
  if (value === null) {
    return null;
  }
  if ("ref" in typeDefinition) {
    return toFunctionValue(
      schema,
      value,
      schemaUtils.getType(schema, typeDefinition),
      timeZone,
    );
  }
  if (typeDefinition.dataType === DataType.Struct) {
    return Object.fromEntries(
      Object.entries(typeDefinition.properties).map(
        ([propertyName, propertyTypeDefinition]) => [
          propertyName,
          toFunctionValue(
            schema,
            value[propertyName],
            propertyTypeDefinition,
            timeZone,
          ),
        ],
      ),
    );
  }
  if (typeDefinition.dataType === DataType.List) {
    return (value as unknown[]).map((item) =>
      toFunctionValue(schema, item, typeDefinition.items, timeZone),
    );
  }
  if (
    typeDefinition.dataType === DataType.String &&
    typeDefinition.format === FormatId.String.Instant
  ) {
    return DateTime.fromISO(value).setZone(timeZone).toISO();
  }
  return value;
}
