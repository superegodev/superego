import { defineConfig } from "vitest/config";

const repeatTimes =
  Number.parseInt(process.env["SUPEREGO_TESTS_REPEAT_TIMES"] ?? "1", 10) || 1;

export default defineConfig({
  test: {
    testTimeout: 30_000 * repeatTimes,
    setupFiles: ["src/vitest-setup.ts"],
    onStackTrace(_error, { file }) {
      if (file.includes("src/utils")) {
        return false;
      }
    },
  },
});
