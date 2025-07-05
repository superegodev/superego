import * as v from "valibot";
import i18nString from "../i18nString/i18nString.js";

export default function described() {
  return v.object({
    description: v.optional(i18nString()),
  });
}
