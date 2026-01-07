import type { MessageFormatElement } from "react-intl";
import messagesEn from "./compiled/en.json" with { type: "json" };
import messagesIt from "./compiled/it.json" with { type: "json" };

type Messages = Record<string, MessageFormatElement[]>;

const messagesByLocale: Record<string, Messages> = {
  en: messagesEn as Messages,
  it: messagesIt as Messages,
};

export default function getMessages(locale: string): Messages {
  const languageCode = locale.split("-")[0]!;
  return messagesByLocale[languageCode] ?? messagesEn;
}
