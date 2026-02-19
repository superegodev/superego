import type { DistributiveOmit } from "@superego/global-types";
import MessageSender from "./MessageSender.js";
import MessageType from "./MessageType.js";
import {
  type InvokeBackendMethodMessage,
  isRenderAppMessage,
  isRespondToBackendMethodInvocationMessage,
  type NavigateHostToMessage,
  type RenderAppMessage,
  type RespondToBackendMethodInvocationMessage,
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
      SandboxReadyMessage | InvokeBackendMethodMessage | NavigateHostToMessage,
      "sender"
    >,
  ) {
    this.host.postMessage({ sender: MessageSender.Sandbox, ...message }, "*");
  }

  /** Register handlers for messages coming from the Host. */
  registerHandlers(
    handlers: Partial<{
      [MessageType.RenderApp]: (message: RenderAppMessage) => void;
      [MessageType.RespondToBackendMethodInvocation]: (
        message: RespondToBackendMethodInvocationMessage,
      ) => void;
    }>,
  ) {
    const handleMessage = ({ data: message }: MessageEvent) => {
      if (isRenderAppMessage(message) && handlers[MessageType.RenderApp]) {
        handlers[MessageType.RenderApp](message);
      }
      if (
        isRespondToBackendMethodInvocationMessage(message) &&
        handlers[MessageType.RespondToBackendMethodInvocation]
      ) {
        handlers[MessageType.RespondToBackendMethodInvocation](message);
      }
      // Ignore other messages.
    };
    this.sandbox.addEventListener("message", handleMessage);
    return () => this.sandbox.removeEventListener("message", handleMessage);
  }
}
