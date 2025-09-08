import { registerBackendTests } from "@superego/backend/tests";
import ExecutingBackend from "./ExecutingBackend.js";

registerBackendTests(async () => {
  const backend = new ExecutingBackend();
  return { backend };
});
