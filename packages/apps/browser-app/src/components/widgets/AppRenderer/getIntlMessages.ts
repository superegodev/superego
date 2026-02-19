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
    GeoJSONMap: {
      renderingErrorAlertTitle: intl.formatMessage({
        defaultMessage: "An error occurred rendering the map.",
      }),
    },
    DefaultApp: {
      name: intl.formatMessage({
        defaultMessage: "My Awesome App",
      }),
      infoLine1: intl.formatMessage({
        defaultMessage:
          "In this section you can see the live preview of your app.",
      }),
      infoLine2: intl.formatMessage({
        defaultMessage: "You can vibe-code the app by asking the assistant.",
      }),
      infoLine3: intl.formatMessage({
        defaultMessage:
          "Or, you can write the code yourself by switching to the code view.",
      }),
      collectionInfo: intl.formatMessage({
        defaultMessage: "This app has access to the following collections:",
      }),
    },
    SimpleMonthCalendar: {
      todayButton: intl.formatMessage({ defaultMessage: "Today" }),
      previousMonthButton: intl.formatMessage({
        defaultMessage: "Previous month",
      }),
      nextMonthButton: intl.formatMessage({ defaultMessage: "Next month" }),
      closeDayPopoverButton: intl.formatMessage({ defaultMessage: "Close" }),
    },
    KanbanBoard: {
      dragButton: intl.formatMessage({ defaultMessage: "Drag" }),
    },
  };
}
