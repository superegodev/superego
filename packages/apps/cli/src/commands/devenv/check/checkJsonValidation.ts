import { existsSync } from "node:fs";
import * as v from "valibot";
import readJsonFile from "../utils/readJsonFile.js";
import type CheckResult from "./CheckResult.js";

export default function checkJsonValidation(
  target: string,
  filePath: string,
  schema: v.GenericSchema<any, any>,
): CheckResult {
  if (!existsSync(filePath)) {
    return { target: target, success: false, errors: ["File not found"] };
  }

  let data: unknown;
  try {
    data = readJsonFile(filePath);
  } catch {
    return { target: target, success: false, errors: ["Invalid JSON"] };
  }

  const result = v.safeParse(schema, data);
  if (result.success) {
    return { target: target, success: true };
  }

  return {
    target: target,
    success: false,
    errors: result.issues.map((issue) => issue.message),
  };
}
