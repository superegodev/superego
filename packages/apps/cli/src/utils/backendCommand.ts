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
  const argumentSchemas = getArgumentSchemas(UsecaseClass);

  for (const [index, argument] of commandArguments.entries()) {
    if ("fixedValue" in argument) {
      continue;
    }
    const acceptsPlainString = isStringLikeArgumentSchema(
      argumentSchemas[index],
    );
    const flags = `--${argument.name} <${
      acceptsPlainString ? "value" : "json"
    }>`;
    const optionDescription = `${
      argument.required === false ? "Optional" : "Required"
    }. ${argument.description}${acceptsPlainString ? "." : " JSON."}`;
    command = command.option(flags, optionDescription);
  }

  command.action(async (options: Record<string, string | undefined>) => {
    await runCommand(async () => {
      const parsedArguments = readArguments(
        commandArguments,
        argumentSchemas,
        options,
      );
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
  argumentSchemas: (v.GenericSchema<unknown, unknown> | undefined)[],
  options: Record<string, string | undefined>,
) {
  const parsed: unknown[] = [];
  for (const [index, argument] of commandArguments.entries()) {
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
    const parsedArgument = parseArgument(
      raw,
      argumentSchemas[index],
      argument.name,
    );
    if (!parsedArgument.success) {
      return parsedArgument;
    }
    parsed.push(parsedArgument.data);
  }
  return { success: true as const, data: parsed, error: null };
}

function parseArgument(
  raw: string,
  schema: v.GenericSchema<unknown, unknown> | undefined,
  name: string,
) {
  if (schema && isStringLikeArgumentSchema(schema)) {
    if (raw === "null" && isNullableArgumentSchema(schema)) {
      return { success: true as const, data: null, error: null };
    }
    if (raw.startsWith('"')) {
      try {
        return {
          success: true as const,
          data: JSON.parse(raw) as unknown,
          error: null,
        };
      } catch (error) {
        return unsuccessfulResult("ArgumentsNotValid", {
          issues: [
            {
              message: `--${name} must be a plain string or valid JSON string: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        });
      }
    }
    return { success: true as const, data: raw, error: null };
  }

  try {
    return {
      success: true as const,
      data: JSON.parse(raw) as unknown,
      error: null,
    };
  } catch (error) {
    return unsuccessfulResult("ArgumentsNotValid", {
      issues: [
        {
          message: `--${name} must be valid JSON: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    });
  }
}

function isStringLikeArgumentSchema(
  schema: v.GenericSchema<unknown, unknown> | undefined,
): boolean {
  if (!schema) {
    return false;
  }
  const schemaInternals = schema as any;
  switch (schemaInternals.type) {
    case "string":
    case "custom":
      return true;
    case "optional":
    case "nullable":
      return isStringLikeArgumentSchema(schemaInternals.wrapped);
    case "union":
      return schemaInternals.options.every(isStringLikeArgumentSchema);
    default:
      return false;
  }
}

function isNullableArgumentSchema(
  schema: v.GenericSchema<unknown, unknown>,
): boolean {
  const schemaInternals = schema as any;
  switch (schemaInternals.type) {
    case "nullable":
      return true;
    case "optional":
      return isNullableArgumentSchema(schemaInternals.wrapped);
    case "union":
      return schemaInternals.options.some(
        (option: v.GenericSchema<unknown, unknown>) =>
          isNullArgumentSchema(option) || isNullableArgumentSchema(option),
      );
    default:
      return false;
  }
}

function isNullArgumentSchema(
  schema: v.GenericSchema<unknown, unknown>,
): boolean {
  return (schema as any).type === "null";
}

function getArgumentSchemas(UsecaseClass: BackendUsecaseClass) {
  return (getArgumentsSchema(UsecaseClass) as TupleSchemaWithItems).items ?? [];
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
  const argumentSchemas = getArgumentSchemas(UsecaseClass);
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
