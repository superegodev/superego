import { FormattedDate, FormattedNumber, FormattedTime } from "react-intl";
import {
  isValidInstant,
  isValidPlainDate,
  isValidPlainTime,
} from "../../../../../../core/schema/src/utils/dateTimeValidators.js";

interface Props {
  value: string | number | boolean | null | undefined;
}
export default function ContentSummaryPropertyValue({ value }: Props) {
  switch (typeof value) {
    case "string": {
      return isValidInstant(value) ? (
        <FormattedDate value={value} dateStyle="medium" timeStyle="medium" />
      ) : isValidPlainDate(value) ? (
        <FormattedDate value={value} dateStyle="medium" />
      ) : isValidPlainTime(value) ? (
        <FormattedTime value={`1970-01-01${value}`} timeStyle="medium" />
      ) : (
        value
      );
    }
    case "number":
      return <FormattedNumber value={value} />;
    case "boolean":
      return value ? "✓" : "✖";
    default:
      return null;
  }
}
