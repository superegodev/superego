import type { DistributiveOmit } from "@superego/global-types";
import MessageSender from "./MessageSender.js";
import MessageType from "./MessageType.js";
import {
  type HeightChangedMessage,
  isHeightChangedMessage,
  isSandboxReadyMessage,
  type RenderAppMessage,
  type SandboxReadyMessage,
} from "./messages.js";

export default class HostIpc {
  constructor(
    private host: Window,
    private sandbox: Window,
  ) {}

  /** Send a Host message. */
  send(message: DistributiveOmit<RenderAppMessage, "sender">) {
    this.sandbox.postMessage({ sender: MessageSender.Host, ...message }, "*");
  }

  /** Register handlers for messages coming from the Sandbox. */
  registerHandlers(handlers: {
    [MessageType.SandboxReady]: (message: SandboxReadyMessage) => void;
    [MessageType.HeightChanged]: (message: HeightChangedMessage) => void;
  }): () => void {
    const handleMessage = ({ data: message }: MessageEvent) => {
      if (isSandboxReadyMessage(message)) {
        handlers[MessageType.SandboxReady](message);
      } else if (isHeightChangedMessage(message)) {
        handlers[MessageType.HeightChanged](message);
      }
      // Ignore other messages.
    };
    this.host.addEventListener("message", handleMessage);
    return () => this.host.removeEventListener("message", handleMessage);
  }
}
