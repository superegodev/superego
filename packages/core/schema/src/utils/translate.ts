import type { I18nString } from "@superego/global-types";

// Ignore-rule explanation: that's exactly how we want the signature to be.
// biome-ignore lint/style/useDefaultParameterLast: see above.
export default function translate(lang = "en", i18nString: I18nString): string {
  return i18nString[lang] ?? i18nString.en;
}
