import type AppComponentProps from "../types/AppComponentProps.js";
import type IntlMessages from "../types/IntlMessages.js";
import type Settings from "../types/Settings.js";
import isMessageWith from "./isMessageWith.js";
import MessageSender from "./MessageSender.js";
import MessageType from "./MessageType.js";

interface BaseMessage<
  Sender extends MessageSender,
  Type extends MessageType,
  Payload,
> {
  sender: Sender;
  type: Type;
  payload: Payload;
}

///////////////////
// Host messages //
///////////////////

export type RenderAppMessage = BaseMessage<
  MessageSender.Host,
  MessageType.RenderApp,
  {
    appCode: string;
    appProps: AppComponentProps;
    settings: Settings;
    intlMessages: IntlMessages;
  }
>;
export function isRenderAppMessage(
  message: unknown,
): message is RenderAppMessage {
  return isMessageWith(message, MessageSender.Host, MessageType.RenderApp);
}

//////////////////////
// Sandbox messages //
//////////////////////

export type SandboxReadyMessage = BaseMessage<
  MessageSender.Sandbox,
  MessageType.SandboxReady,
  null
>;
export function isSandboxReadyMessage(
  message: unknown,
): message is SandboxReadyMessage {
  return isMessageWith(
    message,
    MessageSender.Sandbox,
    MessageType.SandboxReady,
  );
}

export type HeightChangedMessage = BaseMessage<
  MessageSender.Sandbox,
  MessageType.HeightChanged,
  {
    /** Height in px. */
    height: number;
  }
>;
export function isHeightChangedMessage(
  message: unknown,
): message is HeightChangedMessage {
  return isMessageWith(
    message,
    MessageSender.Sandbox,
    MessageType.HeightChanged,
  );
}
