import { Command } from "commander";
import * as v from "valibot";
import { readArgsFile } from "./argsFile.js";
import createBackend from "./createBackend.js";
import { useMarkdownHelp } from "./markdownHelp.js";
import { runCommand, unsuccessfulResult } from "./results.js";

type CliBackend = Awaited<ReturnType<typeof createBackend>>;
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
  additionalNotes?: string;
}

export default function createBackendCommand({
  name,
  description,
  UsecaseClass,
  getCall,
  arguments: commandArguments = [],
  additionalNotes,
}: BackendCommandOptions): Command {
  let command = new Command(name).description(description);

  if (hasInputArguments(commandArguments)) {
    if (hasRequiredInputArguments(commandArguments)) {
      command = command.requiredOption(
        "--args <file>",
        "Path to JSON args file.",
      );
    } else {
      command = command.option("--args <file>", "Path to JSON args file.");
    }
  }

  command.action(async (options: { args?: string }) => {
    await runCommand(async () => {
      const argsFileResult = options.args
        ? readArgsFile(options.args)
        : ({ success: true, data: {}, error: null } as const);
      if (!argsFileResult.success) {
        return argsFileResult;
      }

      const parsedArguments = readArguments(
        commandArguments,
        argsFileResult.data!,
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

      return getCall(await createBackend())(...validationResult.output);
    });
  });

  return useMarkdownHelp(command, {
    argsSchema: hasInputArguments(commandArguments)
      ? getArgsSchema(UsecaseClass, commandArguments)
      : undefined,
    additionalNotes,
  });
}

function readArguments(
  commandArguments: BackendCommandArgument[],
  args: Record<string, unknown>,
) {
  const expectedKeys = commandArguments
    .filter((argument) => !("fixedValue" in argument))
    .map((argument) => toOptionPropertyName(argument.name));
  const unknownKeys = Object.keys(args).filter(
    (key) => !expectedKeys.includes(key),
  );
  if (unknownKeys.length > 0) {
    return unsuccessfulResult("ArgumentsNotValid", {
      issues: unknownKeys.map((key) => ({
        message: `Unknown args key "${key}".`,
        path: [{ key }],
      })),
    });
  }

  const parsed: unknown[] = [];
  for (const argument of commandArguments) {
    if ("fixedValue" in argument) {
      parsed.push(argument.fixedValue);
      continue;
    }
    const key = toOptionPropertyName(argument.name);
    const raw = args[key];
    if (raw === undefined) {
      if (argument.required !== false) {
        return unsuccessfulResult("ArgumentsNotValid", {
          issues: [{ message: `Missing required args key "${key}".` }],
        });
      }
      parsed.push(undefined);
      continue;
    }
    parsed.push(raw);
  }
  return { success: true as const, data: parsed, error: null };
}

function getArgumentSchemas(UsecaseClass: BackendUsecaseClass) {
  return (getArgumentsSchema(UsecaseClass) as TupleSchemaWithItems).items ?? [];
}

function hasInputArguments(
  commandArguments: BackendCommandArgument[],
): boolean {
  return commandArguments.some((argument) => !("fixedValue" in argument));
}

function hasRequiredInputArguments(
  commandArguments: BackendCommandArgument[],
): boolean {
  return commandArguments.some(
    (argument) => !("fixedValue" in argument) && argument.required !== false,
  );
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

function getArgsSchema(
  UsecaseClass: BackendUsecaseClass,
  commandArguments: BackendCommandArgument[],
) {
  const argumentSchemas = getArgumentSchemas(UsecaseClass);
  const inputArguments = commandArguments
    .map((argument, index) => ({ argument, index }))
    .filter(({ argument }) => !("fixedValue" in argument));
  return v.strictObject(
    Object.fromEntries(
      inputArguments.map(({ argument, index }) => [
        toOptionPropertyName(argument.name),
        toArgsFilePropertySchema(argument, argumentSchemas[index] ?? v.any()),
      ]),
    ),
  );
}

function toArgsFilePropertySchema(
  argument: BackendCommandArgument,
  schema: v.GenericSchema<unknown, unknown>,
): v.GenericSchema<unknown, unknown> {
  if (argument.required === false) {
    return v.optional(schema);
  }
  return schema;
}
