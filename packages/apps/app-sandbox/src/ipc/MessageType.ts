enum MessageType {
  // Sent by host:
  RenderApp = "RenderApp",
  RespondToBackendMethodInvocation = "RespondToBackendMethodInvocation",
  // Sent by sandbox:
  SandboxReady = "SandboxReady",
  HeightChanged = "HeightChanged",
  InvokeBackendMethod = "InvokeBackendMethod",
  NavigateHostTo = "NavigateHostTo",
}
export default MessageType;
