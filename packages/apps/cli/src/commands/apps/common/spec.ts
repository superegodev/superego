import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Missing files in older checkouts preserve the stored specification. */
export function readSpec(path: string, previousSpec = ""): string {
  try {
    return readFileSync(join(path, "spec.md"), "utf-8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return previousSpec;
    }
    throw error;
  }
}
