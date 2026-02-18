import { existsSync, readFileSync } from "node:fs";
import type CheckResult from "./CheckResult.js";

export default function checkGeneratedTypes(
  target: string,
  filePath: string,
  expectedSource: string,
): CheckResult {
  if (!existsSync(filePath)) {
    return {
      target: target,
      success: false,
      errors: ["File not found. Run `generate-types` to create it."],
    };
  }

  const actual = readFileSync(filePath, "utf-8");
  if (normalizeNewlines(actual) !== normalizeNewlines(expectedSource)) {
    return {
      target: target,
      success: false,
      errors: [
        "Generated types are out of date. Run `generate-types` to update.",
      ],
    };
  }

  return { target: target, success: true };
}

function normalizeNewlines(str: string): string {
  return str.replace(/\r\n/g, "\n");
}
