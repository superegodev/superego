import type { FieldDiff } from "./types.js";

export default function makeFieldDiff<Value>(
  local: Value,
  remote: Value,
): FieldDiff<Value> {
  return { changed: local !== remote, local, remote };
}
