import { writeFile } from "node:fs/promises";
import { dirname, extname, join, parse } from "node:path";
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
        expect(await target.screenshot()).toMatchSnapshot(snapshotName);

        const info = test.info();
        const snapshotDirectory = join(
          dirname(info.file),
          `${parse(info.file).base}-snapshots`,
        );
        const parsedSnapshotName = parse(snapshotName);
        const extension = extname(snapshotName) || ".png";
        const snapshotFileName = `${parsedSnapshotName.name}-${info.project.name}-${process.platform}${extension}`;
        const expectationFileName = `${parse(snapshotFileName).name}.txt`;

        await writeFile(
          join(snapshotDirectory, expectationFileName),
          expectation,
          "utf8",
        );
      },
      { box: true },
    );
  },
};
