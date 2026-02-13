import { expect, type Page, test } from "@playwright/test";

export default {
  async expectToSee(snapshotName: string, target: Page, expectation: string) {
    await test.step(
      `Expect to see: ${expectation}`,
      async () =>
        expect(await target.screenshot()).toMatchSnapshot(snapshotName),
      { box: true },
    );
  },
};
