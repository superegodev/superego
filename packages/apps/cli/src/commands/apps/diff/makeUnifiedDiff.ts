import makeLineChanges from "./makeLineChanges.js";
import makeUnifiedDiffHunks from "./makeUnifiedDiffHunks.js";
import splitLines from "./splitLines.js";

export default function makeUnifiedDiff(
  remoteLabel: string,
  remoteSource: string,
  localLabel: string,
  localSource: string,
): string {
  const changes = makeLineChanges(
    splitLines(remoteSource),
    splitLines(localSource),
  );
  return [
    `--- ${remoteLabel}`,
    `+++ ${localLabel}`,
    ...makeUnifiedDiffHunks(changes),
    "",
  ].join("\n");
}
