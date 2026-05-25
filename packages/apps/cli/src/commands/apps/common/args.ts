import type { Command } from "commander";
import {
  assertNoUnknownArgs,
  getOptionalStringArg,
  getOptionalStringArrayArg,
  getRequiredStringArg,
  readArgsFileOrThrow,
} from "../../../utils/argsFile.js";

export function requireArgsFile(command: Command): Command {
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
