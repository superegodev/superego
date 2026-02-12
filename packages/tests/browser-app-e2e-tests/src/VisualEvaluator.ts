import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Locator, type Page, test } from "@playwright/test";

export default {
  async expectToSee(
    snapshotName: string,
    target: Page | Locator,
    expectation: string,
  ) {
    await test.step(
      `Expect to see: ${expectation}`,
      async () => {
        const snapshotDir = test.info().snapshotDir;
        mkdirSync(snapshotDir, { recursive: true });
        const requirementFileName = snapshotName.replace(/\.png$/, ".txt");
        writeFileSync(join(snapshotDir, requirementFileName), expectation);

        expect(await target.screenshot()).toMatchSnapshot(snapshotName);
      },
      { box: true },
    );
  },
};
