import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function readMainSource(path: string): string {
  const mainPath = join(path, "main.tsx");
  if (!existsSync(mainPath)) {
    throw new Error("main.tsx is missing.");
  }
  return readFileSync(mainPath, "utf-8");
}
