import { expect, type Page, test } from "@playwright/test";

export default {
  async expectToSee(snapshotName: string, target: Page, expectation: string) {
    await test.step(
      `Expect to see: ${expectation}`,
      async () => expect(target).toHaveScreenshot(snapshotName),
      { box: true },
    );
  },
};
