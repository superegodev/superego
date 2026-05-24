import type { LineChange } from "./types.js";

export default function makeLineChanges(
  remoteLines: string[],
  localLines: string[],
): LineChange[] {
  const longestCommonSubsequenceLengths = Array.from(
    { length: remoteLines.length + 1 },
    () => Array.from({ length: localLines.length + 1 }, () => 0),
  );

  for (
    let remoteIndex = remoteLines.length - 1;
    remoteIndex >= 0;
    remoteIndex -= 1
  ) {
    for (
      let localIndex = localLines.length - 1;
      localIndex >= 0;
      localIndex -= 1
    ) {
      longestCommonSubsequenceLengths[remoteIndex]![localIndex] =
        remoteLines[remoteIndex] === localLines[localIndex]
          ? longestCommonSubsequenceLengths[remoteIndex + 1]![localIndex + 1]! +
            1
          : Math.max(
              longestCommonSubsequenceLengths[remoteIndex + 1]![localIndex]!,
              longestCommonSubsequenceLengths[remoteIndex]![localIndex + 1]!,
            );
    }
  }

  const changes: LineChange[] = [];
  let remoteIndex = 0;
  let localIndex = 0;
  while (remoteIndex < remoteLines.length || localIndex < localLines.length) {
    if (
      remoteIndex < remoteLines.length &&
      localIndex < localLines.length &&
      remoteLines[remoteIndex] === localLines[localIndex]
    ) {
      changes.push({ kind: "equal", line: remoteLines[remoteIndex]! });
      remoteIndex += 1;
      localIndex += 1;
    } else if (
      localIndex < localLines.length &&
      (remoteIndex === remoteLines.length ||
        longestCommonSubsequenceLengths[remoteIndex]![localIndex + 1]! >=
          longestCommonSubsequenceLengths[remoteIndex + 1]![localIndex]!)
    ) {
      changes.push({ kind: "insert", line: localLines[localIndex]! });
      localIndex += 1;
    } else {
      changes.push({ kind: "delete", line: remoteLines[remoteIndex]! });
      remoteIndex += 1;
    }
  }
  return changes;
}
