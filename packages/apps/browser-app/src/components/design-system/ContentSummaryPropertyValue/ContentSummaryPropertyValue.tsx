import { utils } from "@superego/schema";
import { FormattedDate, FormattedNumber, FormattedTime } from "react-intl";

interface Props {
  value: string | number | boolean | null | undefined;
}
export default function ContentSummaryPropertyValue({ value }: Props) {
  switch (typeof value) {
    case "string": {
      return utils.isValidInstant(value) ? (
        <FormattedDate value={value} dateStyle="medium" timeStyle="medium" />
      ) : utils.isValidPlainDate(value) ? (
        <FormattedDate value={value} timeZone="UTC" dateStyle="medium" />
      ) : utils.isValidPlainTime(value) ? (
        <FormattedTime
          value={toEpochDayUtcIso(value)}
          timeZone="UTC"
          timeStyle="medium"
        />
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

/**
 * Transforms plain time to full ISO 8601 instant with Z UTC offset, since
 * FormattedTime expects that as a value.
 */
function toEpochDayUtcIso(plainTime: string): string {
  const [hh, mm = "00", rest = "00"] = plainTime.replace(/^T/, "").split(":");
  const [ss = "00", decimals = ""] = rest.split(".");
  const ms = decimals ? `.${decimals.padEnd(3, "0")}` : "";
  return `1970-01-01T${hh!.padStart(2, "0")}:${mm}:${ss}${ms}Z`;
}
