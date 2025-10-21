import { useContext } from "react";
import type IntlMessages from "../../../types/IntlMessages.js";
import IntlMessagesContext from "./IntlMessagesContext.js";

export default function useIntlMessages(
  component: keyof IntlMessages,
): IntlMessages[typeof component] {
  const intlMessages = useContext(IntlMessagesContext);
  if (intlMessages === null) {
    throw new Error(
      "You must be inside a IntlMessagesContext.Provider to use this hook.",
    );
  }
  return intlMessages[component];
}
