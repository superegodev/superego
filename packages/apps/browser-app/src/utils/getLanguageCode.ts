import type { IntlShape } from "react-intl";

export default function getLanguageCode(intl: IntlShape): string {
  return intl.locale.slice(0, 2);
}
