import type * as globalTypes from "@superego/global-types";
import { useIntl } from "react-intl";
import getLanguageCode from "../../../utils/getLanguageCode.js";

interface Props {
  value: globalTypes.I18nString;
}
export default function I18nString({ value }: Props) {
  const intl = useIntl();
  const languageCode = getLanguageCode(intl);
  return value[languageCode] ?? value.en;
}
