import type { DistributiveOmit } from "@superego/global-types";
import MessageSender from "./MessageSender.js";
import MessageType from "./MessageType.js";
import {
  type HeightChangedMessage,
  isRenderAppMessage,
  type RenderAppMessage,
  type SandboxReadyMessage,
} from "./messages.js";

export default class SandboxIpc {
  constructor(
    private host: Window,
    private sandbox: Window,
  ) {}

  /** Send a Sandbox message to the Host. */
  send(
    message: DistributiveOmit<
      SandboxReadyMessage | HeightChangedMessage,
      "sender"
    >,
  ) {
    this.host.postMessage({ sender: MessageSender.Sandbox, ...message }, "*");
  }

  /** Register handlers for messages coming from the Host. */
  registerHandlers(handlers: {
    [MessageType.RenderApp]: (message: RenderAppMessage) => void;
  }) {
    const handleMessage = ({ data: message }: MessageEvent) => {
      if (isRenderAppMessage(message)) {
        handlers[MessageType.RenderApp](message);
      }
      // Ignore other messages.
    };
    this.sandbox.addEventListener("message", handleMessage);
    return () => this.sandbox.removeEventListener("message", handleMessage);
  }
}
