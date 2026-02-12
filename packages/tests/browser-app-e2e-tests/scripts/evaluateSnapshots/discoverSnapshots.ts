import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import type { SnapshotEntry } from "./types.ts";

const scenariosDirectory = resolve(
  import.meta.dirname,
  "../../src/scenarios",
);

export function discoverSnapshots(): SnapshotEntry[] {
  const entries = readdirSync(scenariosDirectory);
  const testFiles = entries.filter((entry) => entry.endsWith(".test.ts"));
  const snapshots: SnapshotEntry[] = [];

  for (const testFile of testFiles) {
    const snapshotsDir = join(scenariosDirectory, `${testFile}-snapshots`);
    if (!existsSync(snapshotsDir)) continue;

    const files = readdirSync(snapshotsDir);
    const requirementFiles = files.filter((f) => f.endsWith(".txt"));
    const pngFiles = files.filter((f) => f.endsWith(".png"));

    for (const requirementFile of requirementFiles) {
      const stepIndex = requirementFile.replace(".txt", "");
      const matchingPng = pngFiles.find((f) => f.startsWith(`${stepIndex}-`));
      if (!matchingPng) continue;

      snapshots.push({
        testFileName: testFile,
        stepIndex,
        snapshotPath: join(snapshotsDir, matchingPng),
        requirementPath: join(snapshotsDir, requirementFile),
      });
    }
  }

  return snapshots;
}
