import { Theme } from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import DemoDataRepositoriesManager from "./DemoDataRepositoriesManager.js";

registerDataRepositoriesTests(async () => {
  const dataRepositoriesManager = new DemoDataRepositoriesManager(
    { theme: Theme.Auto },
    crypto.randomUUID().replaceAll("-", ""),
  );
  return { dataRepositoriesManager };
});
