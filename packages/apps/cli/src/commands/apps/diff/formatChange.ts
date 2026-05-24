import type { LineChange } from "./types.js";

export default function formatChange(change: LineChange): string {
  if (change.kind === "equal") {
    return ` ${change.line}`;
  }
  if (change.kind === "delete") {
    return `-${change.line}`;
  }
  return `+${change.line}`;
}
