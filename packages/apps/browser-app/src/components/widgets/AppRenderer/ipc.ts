import type AppComponentProps from "./AppComponentProps.js";

export enum MessageType {
  // Sent by host:
  RenderApp = "RenderApp",
  // Sent by sandbox:
  SandboxReady = "SandboxReady",
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
