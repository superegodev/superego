import {
  type Conversation,
  type GlobalSettings,
  type Message,
  MessageRole,
} from "@superego/backend";
import type { Milliseconds } from "@superego/global-types";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import formatDuration from "../../../utils/formatDuration.js";

interface Props {
  message: Message.ContentAssistant;
  conversation: Conversation;
}
export default function ThinkingTime({ message, conversation }: Props) {
  const intl = useIntl();
  const { globalSettings } = useGlobalData();
  const thinkingTime = getThinkingTime(message, conversation);
  const modelName = getModelName(message, globalSettings);
  return thinkingTime ? (
    <FormattedMessage
      defaultMessage={"{model} thought for {time}"}
      values={{
        model: modelName,
        time: formatDuration(thinkingTime, intl),
      }}
    />
  ) : null;
}

function getThinkingTime(
  message: Message.ContentAssistant,
  conversation: Conversation,
): Milliseconds | null {
  const indexOfMessage = conversation.messages.indexOf(message);
  let previousUserMessage: Message.User | null = null;
  for (let i = indexOfMessage; i >= 0; i--) {
    const previousMessage = conversation.messages[i];
    if (previousMessage?.role === MessageRole.User) {
      previousUserMessage = previousMessage;
      break;
    }
  }
  return previousUserMessage
    ? message.createdAt.getTime() - previousUserMessage.createdAt.getTime()
    : null;
}

function getModelName(
  message: Message.ContentAssistant,
  globalSettings: GlobalSettings,
): string {
  const { providerModelRef } = message.inferenceOptions.completion;
  const provider = globalSettings.inference.providers.find(
    ({ name }) => name === providerModelRef.providerName,
  );
  return (
    provider?.models.find(({ id }) => id === providerModelRef.modelId)?.name ??
    providerModelRef.modelId
  );
}
