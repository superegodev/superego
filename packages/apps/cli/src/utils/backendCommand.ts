import { SchemaJsonSchema } from "@superego/schema";
import { toJsonSchema, type JsonSchema } from "@valibot/to-json-schema";
import { Command } from "commander";
import * as v from "valibot";
import { createCliBackend } from "./backend.js";
import {
  setJsonOptionsHelp,
  setMarkdownHelp,
  useMarkdownHelp,
} from "./markdownHelp.js";
import { runCommand, unsuccessfulResult } from "./results.js";

type CliBackend = Awaited<ReturnType<typeof createCliBackend>>;
type BackendCall = (...args: any[]) => Promise<{ success: boolean }>;
type BackendUsecaseClass = new (...args: any[]) => {
  argumentsSchema: v.GenericSchema<unknown, any[]>;
};
type TupleSchemaWithItems = v.GenericSchema<unknown, any[]> & {
  items?: v.GenericSchema<unknown, unknown>[];
};

interface BackendCommandArgument {
  name: string;
  description: string;
  required?: boolean;
  fixedValue?: unknown;
}

interface BackendCommandOptions {
  name: string;
  description: string;
  UsecaseClass: BackendUsecaseClass;
  getCall: (backend: CliBackend) => BackendCall;
  arguments?: BackendCommandArgument[];
  help?: string;
}

export default function createBackendCommand({
  name,
  description,
  UsecaseClass,
  getCall,
  arguments: commandArguments = [],
  help,
}: BackendCommandOptions): Command {
  let command = new Command(name).description(description);

  for (const argument of commandArguments) {
    if ("fixedValue" in argument) {
      continue;
    }
    const flags = `--${argument.name} <json>`;
    const optionDescription = `${
      argument.required === false ? "Optional" : "Required"
    }. ${argument.description} JSON.`;
    command = command.option(flags, optionDescription);
  }

  command.action(async (options: Record<string, string | undefined>) => {
    await runCommand(async () => {
      const parsedArguments = readArguments(commandArguments, options);
      if (!parsedArguments.success) {
        return parsedArguments;
      }

      const validationResult = v.safeParse(
        getArgumentsSchema(UsecaseClass),
        parsedArguments.data,
      );
      if (!validationResult.success) {
        return unsuccessfulResult("ArgumentsNotValid", {
          issues: validationResult.issues,
        });
      }

      return getCall(await createCliBackend())(...validationResult.output);
    });
  });

  setJsonOptionsHelp(
    command,
    getJsonOptionsHelp(UsecaseClass, commandArguments),
  );
  if (help) {
    setMarkdownHelp(command, help);
  }
  return useMarkdownHelp(command);
}

function readArguments(
  commandArguments: BackendCommandArgument[],
  options: Record<string, string | undefined>,
) {
  const parsed: unknown[] = [];
  for (const argument of commandArguments) {
    if ("fixedValue" in argument) {
      parsed.push(argument.fixedValue);
      continue;
    }
    const raw = options[toOptionPropertyName(argument.name)];
    if (raw === undefined) {
      if (argument.required !== false) {
        return unsuccessfulResult("ArgumentsNotValid", {
          issues: [{ message: `Missing required option --${argument.name}.` }],
        });
      }
      parsed.push(undefined);
      continue;
    }
    try {
      parsed.push(JSON.parse(raw));
    } catch (error) {
      return unsuccessfulResult("ArgumentsNotValid", {
        issues: [
          {
            message: `--${argument.name} must be valid JSON: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      });
    }
  }
  return { success: true as const, data: parsed, error: null };
}

function toOptionPropertyName(name: string): string {
  return name.replaceAll(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

function getArgumentsSchema(UsecaseClass: BackendUsecaseClass) {
  const usecase = new UsecaseClass(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  );
  return usecase.argumentsSchema;
}

function getJsonOptionsHelp(
  UsecaseClass: BackendUsecaseClass,
  commandArguments: BackendCommandArgument[],
) {
  const argumentSchemas =
    (getArgumentsSchema(UsecaseClass) as TupleSchemaWithItems).items ?? [];
  return commandArguments.flatMap((argument, index) => {
    if ("fixedValue" in argument) {
      return [];
    }
    return [
      {
        name: argument.name,
        schema: toArgumentJsonSchema(argumentSchemas[index]),
      },
    ];
  });
}

function toArgumentJsonSchema(
  schema: v.GenericSchema<unknown, unknown> | undefined,
): JsonSchema {
  if (!schema) {
    return {};
  }
  try {
    const jsonSchema = improveJsonSchema(
      toJsonSchema(sanitizeSchemaForJsonSchema(schema), {
        target: "draft-2020-12",
        typeMode: "input",
        errorMode: "ignore",
      }),
    );
    delete jsonSchema.$schema;
    return jsonSchema;
  } catch (error) {
    return {
      description: `JSON Schema conversion failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

function sanitizeSchemaForJsonSchema(
  schema: v.GenericSchema<unknown, unknown>,
): v.GenericSchema<unknown, unknown> {
  const schemaInternals = schema as any;
  switch (schemaInternals.type) {
    case "custom":
      return v.string();
    case "lazy":
      return v.any();
    case "array":
      return v.array(sanitizeSchemaForJsonSchema(schemaInternals.item));
    case "optional":
      return v.optional(sanitizeSchemaForJsonSchema(schemaInternals.wrapped));
    case "nullable":
      return v.nullable(sanitizeSchemaForJsonSchema(schemaInternals.wrapped));
    case "strict_object":
      return v.strictObject(sanitizeEntries(schemaInternals.entries));
    case "object":
      return v.object(sanitizeEntries(schemaInternals.entries));
    case "loose_object":
      return v.looseObject(sanitizeEntries(schemaInternals.entries));
    case "record":
      return v.record(
        sanitizeSchemaForJsonSchema(schemaInternals.key) as v.GenericSchema<
          string,
          string
        >,
        sanitizeSchemaForJsonSchema(schemaInternals.value),
      );
    case "tuple":
      return v.tuple(schemaInternals.items.map(sanitizeSchemaForJsonSchema));
    case "union":
      return v.union(schemaInternals.options.map(sanitizeSchemaForJsonSchema));
    default:
      return schema;
  }
}

function sanitizeEntries(
  entries: Record<string, v.GenericSchema<unknown, unknown>>,
) {
  return Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [
      key,
      sanitizeSchemaForJsonSchema(value),
    ]),
  );
}

function improveJsonSchema(schema: JsonSchema): JsonSchema {
  if (isWeakCollectionSchemaJsonSchema(schema)) {
    return stripSchemaMetadata(SchemaJsonSchema as JsonSchema);
  }
  if (Array.isArray(schema)) {
    return schema.map((item) =>
      typeof item === "object" && item !== null
        ? improveJsonSchema(item as JsonSchema)
        : item,
    ) as JsonSchema;
  }
  if (typeof schema !== "object" || schema === null) {
    return schema;
  }

  return Object.fromEntries(
    Object.entries(schema).map(([key, value]) => [
      key,
      typeof value === "object" && value !== null
        ? improveJsonSchema(value as JsonSchema)
        : value,
    ]),
  ) as JsonSchema;
}

function isWeakCollectionSchemaJsonSchema(schema: JsonSchema): boolean {
  return (
    typeof schema === "object" &&
    schema !== null &&
    "type" in schema &&
    schema.type === "object" &&
    "properties" in schema &&
    typeof schema.properties === "object" &&
    schema.properties !== null &&
    "types" in schema.properties &&
    "rootType" in schema.properties
  );
}

function stripSchemaMetadata(schema: JsonSchema): JsonSchema {
  const { $schema: _schema, $id: _id, ...schemaWithoutMetadata } = schema;
  return schemaWithoutMetadata;
}
