import { registerTypescriptSandboxTests } from "@superego/executing-backend/tests";
import { FakeTypescriptSandbox } from "./index.browser.js";

registerTypescriptSandboxTests(() => {
  const typescriptSandbox = new FakeTypescriptSandbox();
  return { typescriptSandbox };
});
