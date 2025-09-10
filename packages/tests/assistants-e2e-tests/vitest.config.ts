import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 30_000,
    setupFiles: ["src/vitest-setup.ts"],
    onStackTrace(_error, { file }) {
      if (file.includes("src/utils")) {
        return false;
      }
    },
  },
});
