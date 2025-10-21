import type { IntlMessages } from "@superego/app-sandbox/types";
import type { IntlShape } from "react-intl";

export default function getIntlMessages(intl: IntlShape): IntlMessages {
  return {
    Echart: {
      renderingErrorAlertTitle: intl.formatMessage({
        defaultMessage: "An error occurred rendering the chart.",
      }),
    },
  };
}
