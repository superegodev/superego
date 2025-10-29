import { utils } from "@superego/schema";
import { FormattedDate, FormattedNumber } from "react-intl";

interface Props {
  value: string | number | boolean | null | undefined;
}
export default function ContentSummaryPropertyValue({ value }: Props) {
  switch (typeof value) {
    case "string": {
      return utils.isValidInstant(value) ? (
        <FormattedDate value={value} dateStyle="medium" timeStyle="medium" />
      ) : utils.isValidPlainDate(value) ? (
        <FormattedDate value={`${value}Z`} timeZone="UTC" dateStyle="medium" />
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
