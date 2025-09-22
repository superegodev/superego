import * as v from "valibot";

export default function described() {
  return v.object({
    description: v.optional(v.string()),
  });
}
