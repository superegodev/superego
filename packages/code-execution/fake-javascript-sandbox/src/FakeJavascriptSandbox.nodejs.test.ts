import { registerJavascriptSandboxTests } from "@superego/executing-backend/tests";
import { FakeJavascriptSandbox } from "./index.nodejs.js";

registerJavascriptSandboxTests(async () => {
  const javascriptSandbox = new FakeJavascriptSandbox();
  return { javascriptSandbox };
});
