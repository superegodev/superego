import type { Result } from "@superego/global-types";
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

export type RespondToBackendMethodInvocationMessage = BaseMessage<
  MessageSender.Host,
  MessageType.RespondToBackendMethodInvocation,
  {
    invocationId: string;
    result: Result<any, any>;
  }
>;
export function isRespondToBackendMethodInvocationMessage(
  message: unknown,
): message is RespondToBackendMethodInvocationMessage {
  return isMessageWith(
    message,
    MessageSender.Host,
    MessageType.RespondToBackendMethodInvocation,
  );
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

export type InvokeBackendMethodMessage = BaseMessage<
  MessageSender.Sandbox,
  MessageType.InvokeBackendMethod,
  {
    invocationId: string;
    entity: string;
    method: string;
    args: any[];
  }
>;
export function isInvokeBackendMethodMessage(
  message: unknown,
): message is InvokeBackendMethodMessage {
  return isMessageWith(
    message,
    MessageSender.Sandbox,
    MessageType.InvokeBackendMethod,
  );
}

export type NavigateHostToMessage = BaseMessage<
  MessageSender.Sandbox,
  MessageType.NavigateHostTo,
  {
    href: string;
  }
>;
export function isNavigateHostToMessage(
  message: unknown,
): message is NavigateHostToMessage {
  return isMessageWith(
    message,
    MessageSender.Sandbox,
    MessageType.NavigateHostTo,
  );
}
