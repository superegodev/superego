import { registerJavascriptSandboxTests } from "@superego/executing-backend/tests";
import { FakeJavascriptSandbox } from "./index.browser.js";

registerJavascriptSandboxTests(() => {
  const javascriptSandbox = new FakeJavascriptSandbox();
  return { javascriptSandbox };
});
