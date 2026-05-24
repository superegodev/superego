import formatChange from "./formatChange.js";
import formatRange from "./formatRange.js";
import type { LineChange } from "./types.js";

export default function makeUnifiedDiffHunk(
  changes: LineChange[],
  start: number,
  end: number,
): string[] {
  const priorChanges = changes.slice(0, start);
  const hunkChanges = changes.slice(start, end);
  const remoteLinesBefore = priorChanges.filter(
    (change) => change.kind !== "insert",
  ).length;
  const localLinesBefore = priorChanges.filter(
    (change) => change.kind !== "delete",
  ).length;
  const remoteLineCount = hunkChanges.filter(
    (change) => change.kind !== "insert",
  ).length;
  const localLineCount = hunkChanges.filter(
    (change) => change.kind !== "delete",
  ).length;

  return [
    `@@ -${formatRange(remoteLinesBefore, remoteLineCount)} +${formatRange(
      localLinesBefore,
      localLineCount,
    )} @@`,
    ...hunkChanges.map(formatChange),
  ];
}
