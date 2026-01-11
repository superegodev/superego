import { createIntl, type IntlShape } from "@formatjs/intl";
import type { MessageFormatElement } from "@formatjs/icu-messageformat-parser";
import { app } from "electron";
import messagesEn from "./compiled/en.json" with { type: "json" };
import messagesIt from "./compiled/it.json" with { type: "json" };

type Messages = Record<string, MessageFormatElement[]>;

const messagesByLocale: Record<string, Messages> = {
  en: messagesEn as Messages,
  it: messagesIt as Messages,
};

export default function getIntl(): IntlShape {
  const locale = app.getLocale();
  const languageCode = locale.split("-")[0]!;
  const messages = messagesByLocale[languageCode] ?? messagesEn;
  return createIntl({ locale, messages });
}
