import * as v from "valibot";

export default function icon() {
  return v.pipe(v.string(), v.emoji());
}
