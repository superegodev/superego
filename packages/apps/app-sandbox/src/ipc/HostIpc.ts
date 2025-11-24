import type { DistributiveOmit } from "@superego/global-types";
import MessageSender from "./MessageSender.js";
import MessageType from "./MessageType.js";
import {
  type HeightChangedMessage,
  type InvokeBackendMethodMessage,
  isHeightChangedMessage,
  isInvokeBackendMethodMessage,
  isNavigateHostToMessage,
  isSandboxReadyMessage,
  type NavigateHostToMessage,
  type RenderAppMessage,
  type RespondToBackendMethodInvocationMessage,
  type SandboxReadyMessage,
} from "./messages.js";

export default class HostIpc {
  constructor(
    private host: Window,
    private sandbox: Window,
  ) {}

  /** Send a Host message. */
  send(
    message: DistributiveOmit<
      RenderAppMessage | RespondToBackendMethodInvocationMessage,
      "sender"
    >,
  ) {
    this.sandbox.postMessage({ sender: MessageSender.Host, ...message }, "*");
  }

  /** Register handlers for messages coming from the Sandbox. */
  registerHandlers(handlers: {
    [MessageType.SandboxReady]: (message: SandboxReadyMessage) => void;
    [MessageType.HeightChanged]: (message: HeightChangedMessage) => void;
    [MessageType.InvokeBackendMethod]: (
      message: InvokeBackendMethodMessage,
    ) => void;
    [MessageType.NavigateHostTo]: (message: NavigateHostToMessage) => void;
  }): () => void {
    const handleMessage = ({ data: message }: MessageEvent) => {
      if (isSandboxReadyMessage(message)) {
        handlers[MessageType.SandboxReady](message);
      } else if (isHeightChangedMessage(message)) {
        handlers[MessageType.HeightChanged](message);
      } else if (isInvokeBackendMethodMessage(message)) {
        handlers[MessageType.InvokeBackendMethod](message);
      } else if (isNavigateHostToMessage(message)) {
        handlers[MessageType.NavigateHostTo](message);
      }
      // Ignore other messages.
    };
    this.host.addEventListener("message", handleMessage);
    return () => this.host.removeEventListener("message", handleMessage);
  }
}
