import type { IntlMessages } from "@superego/app-sandbox/types";
import type { IntlShape } from "react-intl";

export default function getIntlMessages(intl: IntlShape): IntlMessages {
  return {
    global: {
      appImportingError: intl.formatMessage({
        defaultMessage: "An error occurred importing the app.",
      }),
      appRenderingError: intl.formatMessage({
        defaultMessage: "An error occurred rendering the app.",
      }),
    },
    Echart: {
      renderingErrorAlertTitle: intl.formatMessage({
        defaultMessage: "An error occurred rendering the chart.",
      }),
    },
  };
}
