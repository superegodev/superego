import { readFileSync } from "node:fs";
import { basename, dirname, isAbsolute, resolve } from "node:path";
import { lookup as lookupMimeType } from "mime-types";
import { type LocalResult, unsuccessfulResult } from "./results.js";

interface Issue {
  message: string;
  path?: { key: string | number }[];
}

export class ArgsFileError extends Error {
  constructor(public details: { issues: Issue[] }) {
    super(
      details.issues.map(({ message }) => message).join("\n") ||
        "Args file is invalid.",
    );
  }
}

export function isArgsFileError(error: unknown): error is ArgsFileError {
  return error instanceof ArgsFileError;
}

export function readArgsFile(
  path: string,
): LocalResult<Record<string, unknown>> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf-8"));
  } catch (error) {
    return issuesResult([
      {
        message: `Unable to read or parse args file: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    ]);
  }

  if (!isRecord(parsed)) {
    return issuesResult([{ message: "Args file must contain a JSON object." }]);
  }

  const expanded = expandFilePlaceholders(parsed, dirname(resolve(path)), []);
  if (!expanded.success) {
    return unsuccessfulResult(expanded.error!.name, expanded.error!.details);
  }
  if (!isRecord(expanded.data)) {
    return issuesResult([{ message: "Args file must contain a JSON object." }]);
  }
  return { success: true, data: expanded.data, error: null };
}

export function readArgsFileOrThrow(path: string): Record<string, unknown> {
  const result = readArgsFile(path);
  if (!result.success) {
    throw new ArgsFileError(result.error!.details as { issues: Issue[] });
  }
  return result.data!;
}

export function assertNoUnknownArgs(
  args: Record<string, unknown>,
  allowedKeys: string[],
): void {
  const allowedKeysSet = new Set(allowedKeys);
  const unknownKeys = Object.keys(args).filter(
    (key) => !allowedKeysSet.has(key),
  );
  if (unknownKeys.length > 0) {
    throw new ArgsFileError({
      issues: unknownKeys.map((key) => ({
        message: `Unknown args key "${key}".`,
        path: [{ key }],
      })),
    });
  }
}

export function getRequiredStringArg(
  args: Record<string, unknown>,
  key: string,
): string {
  const value = args[key];
  if (typeof value !== "string") {
    throw new ArgsFileError({
      issues: [{ message: `"${key}" must be a string.`, path: [{ key }] }],
    });
  }
  return value;
}

export function getOptionalStringArg(
  args: Record<string, unknown>,
  key: string,
  defaultValue: string,
): string {
  const value = args[key];
  if (value === undefined) {
    return defaultValue;
  }
  if (typeof value !== "string") {
    throw new ArgsFileError({
      issues: [{ message: `"${key}" must be a string.`, path: [{ key }] }],
    });
  }
  return value;
}

export function getOptionalStringArrayArg(
  args: Record<string, unknown>,
  key: string,
  defaultValue: string[],
): string[] {
  const value = args[key];
  if (value === undefined) {
    return defaultValue;
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new ArgsFileError({
      issues: [
        { message: `"${key}" must be an array of strings.`, path: [{ key }] },
      ],
    });
  }
  return value;
}

function expandFilePlaceholders(
  value: unknown,
  baseDirectory: string,
  path: (string | number)[],
): LocalResult<unknown> {
  if (Array.isArray(value)) {
    const expandedItems: unknown[] = [];
    for (const [index, item] of value.entries()) {
      const expandedItem = expandFilePlaceholders(item, baseDirectory, [
        ...path,
        index,
      ]);
      if (!expandedItem.success) {
        return expandedItem;
      }
      expandedItems.push(expandedItem.data);
    }
    return { success: true, data: expandedItems, error: null };
  }

  if (!isRecord(value)) {
    return { success: true, data: value, error: null };
  }

  if (Object.hasOwn(value, "$file")) {
    if (Object.keys(value).length !== 1 || typeof value["$file"] !== "string") {
      return issuesResult([
        {
          message: '`$file` placeholders must be exactly { "$file": "path" }.',
          path: toIssuePath(path),
        },
      ]);
    }
    const filePath = isAbsolute(value["$file"])
      ? value["$file"]
      : resolve(baseDirectory, value["$file"]);
    try {
      return {
        success: true,
        data: {
          name: basename(filePath),
          mimeType: lookupMimeType(filePath) || "application/octet-stream",
          content: Uint8Array.from(readFileSync(filePath)),
        },
        error: null,
      };
    } catch (error) {
      return issuesResult([
        {
          message: `Unable to read file placeholder "${filePath}": ${
            error instanceof Error ? error.message : String(error)
          }`,
          path: toIssuePath(path),
        },
      ]);
    }
  }

  const expandedEntries: [string, unknown][] = [];
  for (const [key, childValue] of Object.entries(value)) {
    const expandedChild = expandFilePlaceholders(childValue, baseDirectory, [
      ...path,
      key,
    ]);
    if (!expandedChild.success) {
      return expandedChild;
    }
    expandedEntries.push([key, expandedChild.data]);
  }
  return {
    success: true,
    data: Object.fromEntries(expandedEntries),
    error: null,
  };
}

function issuesResult(issues: Issue[]): LocalResult<never> {
  return unsuccessfulResult("ArgumentsNotValid", { issues });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Uint8Array)
  );
}

function toIssuePath(path: (string | number)[]): { key: string | number }[] {
  return path.map((key) => ({ key }));
}
