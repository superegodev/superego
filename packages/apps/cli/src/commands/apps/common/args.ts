import type { Command } from "commander";
import {
  assertNoUnknownArgs,
  getOptionalStringArg,
  getOptionalStringArrayArg,
  getRequiredStringArg,
  readArgsFileOrThrow,
} from "../../../utils/argsFile.js";
import { setJsonArgsFileHelp } from "../../../utils/markdownHelp.js";

export function requireArgsFile(command: Command, schema: unknown): Command {
  setJsonArgsFileHelp(command, { schema });
  return command.requiredOption("--args <file>", "Path to JSON args file.");
}

export function readAppsArgs(
  path: string,
  allowedKeys: string[],
): Record<string, unknown> {
  const args = readArgsFileOrThrow(path);
  assertNoUnknownArgs(args, allowedKeys);
  return args;
}

export {
  getOptionalStringArg,
  getOptionalStringArrayArg,
  getRequiredStringArg,
};
