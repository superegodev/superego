enum MessageType {
  StateChanged = "StateChanged",
  // Sent by host:
  RenderApp = "RenderApp",
  RespondToBackendMethodInvocation = "RespondToBackendMethodInvocation",
  // Sent by sandbox:
  SandboxReady = "SandboxReady",
  InvokeBackendMethod = "InvokeBackendMethod",
  NavigateHostTo = "NavigateHostTo",
}
export default MessageType;
