import { sameArray } from "../common/commandUtils.js";
import type { FieldDiff } from "./types.js";

export default function makeArrayFieldDiff<Value extends string>(
  local: Value[],
  remote: Value[],
): FieldDiff<Value[]> {
  return {
    changed: !sameArray(local, remote),
    local,
    remote,
  };
}
