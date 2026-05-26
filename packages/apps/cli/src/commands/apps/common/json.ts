import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";

export function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf-8"));
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
