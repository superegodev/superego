import { registerJavascriptSandboxTests } from "@superego/executing-backend/tests";
import { QuickjsJavascriptSandbox } from "./index.nodejs.js";

registerJavascriptSandboxTests(() => {
  const javascriptSandbox = new QuickjsJavascriptSandbox();
  return { javascriptSandbox };
}, [
  // QuickJS always manages to serialize whatever return value into a string, so
  // this test is not necessary and it's not possible to make it pass (there's
  // no value that can possibly trigger the failure).
  "the function returns a value that cannot be serialized",
]);
