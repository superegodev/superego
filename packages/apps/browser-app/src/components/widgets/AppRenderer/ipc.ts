import type { GlobalData } from "../../../business-logic/backend/GlobalData.js";
import type AppComponentProps from "./AppComponentProps.js";

export enum MessageType {
  // Sent by host:
  RenderApp = "RenderApp",
  // Sent by sandbox:
  SandboxReady = "SandboxReady",
  HeightChanged = "HeightChanged",
}

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
    globalData: GlobalData;
  }
>;
export function isRenderAppMessage(
  message: unknown,
): message is RenderAppMessage {
  return (
    message !== null &&
    typeof message === "object" &&
    "type" in message &&
    message.type === MessageType.RenderApp
  );
}

/////////////////////
// Sent by sandbox //
/////////////////////

export type SandboxReadyMessage = BaseMessage<MessageType.SandboxReady, null>;
export function isSandboxReadyMessage(
  message: unknown,
): message is SandboxReadyMessage {
  return (
    message !== null &&
    typeof message === "object" &&
    "type" in message &&
    message.type === MessageType.SandboxReady
  );
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
  return (
    message !== null &&
    typeof message === "object" &&
    "type" in message &&
    message.type === MessageType.HeightChanged
  );
}
