import type { Theme } from "@superego/backend";
import type AppComponentProps from "../AppComponentProps.js";
import isMessageWithType from "./isMessageWithType.js";
import MessageType from "./MessageType.js";

interface BaseMessage<Type extends MessageType, Payload> {
  type: Type;
  payload: Payload;
}

//////////////////
// Sent by host //
//////////////////

export type RenderAppMessage = BaseMessage<
  MessageType.RenderApp,
  {
    appCode: string;
    appProps: AppComponentProps;
    settings: {
      locale: string;
      theme: Theme.Light | Theme.Dark;
    };
  }
>;
export function isRenderAppMessage(
  message: unknown,
): message is RenderAppMessage {
  return isMessageWithType(message, MessageType.RenderApp);
}

/////////////////////
// Sent by sandbox //
/////////////////////

export type SandboxReadyMessage = BaseMessage<MessageType.SandboxReady, null>;
export function isSandboxReadyMessage(
  message: unknown,
): message is SandboxReadyMessage {
  return isMessageWithType(message, MessageType.SandboxReady);
}

export type HeightChangedMessage = BaseMessage<
  MessageType.HeightChanged,
  {
    /** Height in px. */
    height: number;
  }
>;
export function isHeightChangedMessage(
  message: unknown,
): message is HeightChangedMessage {
  return isMessageWithType(message, MessageType.HeightChanged);
}
