import { registerTypescriptSandboxTests } from "@superego/executing-backend/tests";
import { QuickjsTypescriptSandbox } from "./index.browser.js";

registerTypescriptSandboxTests(() => {
  const typescriptSandbox = new QuickjsTypescriptSandbox();
  return { typescriptSandbox };
}, [
  // QuickJS always manages to serialize whatever return value into a string, so
  // this test is not necessary and it's not possible to make it pass (there's
  // no value that can possibly trigger the failure).
  "the function returns a value that cannot be serialized",
]);
