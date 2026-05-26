import makeUnifiedDiffHunk from "./makeUnifiedDiffHunk.js";
import type { LineChange } from "./types.js";

const contextLineCount = 3;

export default function makeUnifiedDiffHunks(changes: LineChange[]): string[] {
  const hunks: string[] = [];
  let index = 0;

  while (index < changes.length) {
    while (index < changes.length && changes[index]!.kind === "equal") {
      index += 1;
    }
    if (index === changes.length) {
      break;
    }

    const start = Math.max(0, index - contextLineCount);
    let lastChangedIndex = index;
    index += 1;
    while (
      index < changes.length &&
      index <= lastChangedIndex + contextLineCount
    ) {
      if (changes[index]!.kind !== "equal") {
        lastChangedIndex = index;
      }
      index += 1;
    }

    const end = Math.min(
      changes.length,
      lastChangedIndex + contextLineCount + 1,
    );
    hunks.push(...makeUnifiedDiffHunk(changes, start, end));
    index = end;
  }

  return hunks;
}
