import type { Milliseconds } from "@superego/global-types";
import type { IntlShape } from "react-intl";

export default function formatDuration(
  duration: Milliseconds,
  intl: IntlShape,
): string {
  return duration < 60_000
    ? intl.formatMessage(
        { defaultMessage: "{seconds, number, ::.##} seconds" },
        { seconds: duration / 1_000 },
      )
    : intl.formatMessage(
        {
          defaultMessage:
            "{minutes, plural, one {1 minute} other {# minutes}} {seconds} seconds",
        },
        {
          minutes: Math.round(duration / 60_000),
          seconds: Math.round((duration % 60_000) / 1000),
        },
      );
}
