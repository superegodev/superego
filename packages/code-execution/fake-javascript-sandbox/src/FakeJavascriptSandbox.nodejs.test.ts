import { registerJavascriptSandboxTests } from "@superego/executing-backend/tests";
import { FakeJavascriptSandbox } from "./index.nodejs.js";

registerJavascriptSandboxTests(() => {
  const javascriptSandbox = new FakeJavascriptSandbox();
  return { javascriptSandbox };
});
