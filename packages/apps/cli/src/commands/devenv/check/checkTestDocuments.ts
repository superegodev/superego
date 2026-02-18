import {
  type Schema,
  valibotSchemas as schemaValibotSchemas,
} from "@superego/schema";
import * as v from "valibot";
import readJsonFile from "../utils/readJsonFile.js";
import type CheckResult from "./CheckResult.js";

export default function checkTestDocuments(
  target: string,
  filePath: string,
  schema: Schema,
): CheckResult {
  let data: unknown;
  try {
    data = readJsonFile(filePath);
  } catch {
    return { target: target, success: false, errors: ["Invalid JSON"] };
  }

  if (!Array.isArray(data)) {
    return {
      target: target,
      success: false,
      errors: ["Expected an array of documents"],
    };
  }

  const errors: string[] = [];
  const contentSchema = schemaValibotSchemas.content(schema, "normal");
  for (let i = 0; i < data.length; i++) {
    const result = v.safeParse(contentSchema, data[i]);
    if (!result.success) {
      errors.push(
        `Document [${i}]: ${result.issues.map((issue) => issue.message).join("; ")}`,
      );
    }
  }
  return errors.length === 0
    ? { target: target, success: true }
    : { target: target, success: false, errors };
}
