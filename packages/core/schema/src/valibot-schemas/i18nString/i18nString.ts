import type { I18nString } from "@superego/global-types";
import * as v from "valibot";

export default function i18nString(): v.GenericSchema<I18nString, I18nString> {
  return v.objectWithRest({ en: v.string() }, v.string());
}
