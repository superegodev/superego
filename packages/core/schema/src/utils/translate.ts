import type { I18nString } from "@superego/global-types";

// oxlint-disable-next-line default-param-last: that's exactly how we want the signature to be.
export default function translate(lang = "en", i18nString: I18nString): string {
  return i18nString[lang] ?? i18nString.en;
}
