import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Schema } from "@superego/schema";
import { valibotSchemas as schemaValibotSchemas } from "@superego/schema";
import * as v from "valibot";
import readJsonFile from "../utils/readJsonFile.js";
import type CheckResult from "./CheckResult.js";

export default function checkDemoDocuments(
  basePath: string,
  schemas: Map<string, Schema>,
): CheckResult[] {
  const demoDocumentsDir = join(basePath, "demo-documents");
  if (!existsSync(demoDocumentsDir)) {
    return [];
  }

  const files = readdirSync(demoDocumentsDir)
    .filter((f) => /^ProtoDocument_\d+\.json$/.test(f))
    .sort();

  return files.map((fileName) => {
    const target = `demo-documents/${fileName}`;
    const filePath = join(demoDocumentsDir, fileName);

    let data: unknown;
    try {
      data = readJsonFile(filePath);
    } catch {
      return { target, success: false, errors: ["Invalid JSON"] };
    }

    if (
      typeof data !== "object" ||
      data === null ||
      !("collectionId" in data) ||
      !("content" in data)
    ) {
      return {
        target,
        success: false,
        errors: ['Expected an object with "collectionId" and "content" fields'],
      };
    }

    const { collectionId, content } = data as {
      collectionId: unknown;
      content: unknown;
    };

    if (typeof collectionId !== "string") {
      return {
        target,
        success: false,
        errors: ['"collectionId" must be a string'],
      };
    }

    const schema = schemas.get(collectionId);
    if (!schema) {
      return {
        target,
        success: false,
        errors: [
          `Unknown collectionId "${collectionId}". Available: ${[...schemas.keys()].join(", ")}`,
        ],
      };
    }

    const contentSchema = schemaValibotSchemas.content(schema, "normal");
    const result = v.safeParse(contentSchema, content);
    if (!result.success) {
      return {
        target,
        success: false,
        errors: result.issues.map((issue) => issue.message),
      };
    }

    return { target, success: true };
  });
}
