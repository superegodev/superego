import type { Command } from "commander";
import * as v from "valibot";
import { ArgsFileError, readArgsFileOrThrow } from "../../../utils/argsFile.js";

export function requireArgsFile(command: Command): Command {
  return command.requiredOption("--args <file>", "Path to JSON args file.");
}

export function readAppsArgs<TInput, TOutput>(
  path: string,
  schema: v.GenericSchema<TInput, TOutput>,
): TOutput {
  const args = readArgsFileOrThrow(path);
  const result = v.safeParse(schema, args);
  if (!result.success) {
    throw new ArgsFileError({
      issues: result.issues.map((issue) => ({
        message: issue.message,
        path: issue.path
          ?.filter(
            (item) =>
              typeof item.key === "string" || typeof item.key === "number",
          )
          .map((item) => ({ key: item.key as string | number })),
      })),
    });
  }
  return result.output;
}
