import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Locator, type Page, test } from "@playwright/test";

export default {
  async expectToSee(
    snapshotName: string,
    target: Page | Locator,
    expectation: string,
  ) {
    const requirementPath = join(
      test.info().snapshotDir,
      snapshotName.replace(".png", ".txt"),
    );
    writeFileSync(requirementPath, expectation);

    await test.step(
      `Expect to see: ${expectation}`,
      async () =>
        expect(await target.screenshot()).toMatchSnapshot(snapshotName),
      { box: true },
    );
  },
};
