import { expect, type Locator, type Page, test } from "@playwright/test";

export default {
  async expectToSee(
    snapshotName: string,
    target: Page | Locator,
    expectation: string,
  ) {
    await test.step(
      `Expect to see: ${expectation}`,
      async () =>
        expect(await takeScreenshot(target)).toMatchSnapshot(snapshotName),
      { box: true },
    );
  },
};

/** Take screenshot, with support for v-scrollable elements. */
async function takeScreenshot(target: Page | Locator): Promise<Buffer> {
  if ("url" in target) {
    return target.screenshot({ fullPage: true });
  }
  const page = target.page();
  const originalSize = page.viewportSize();
  const fullHeight = await target.evaluate((el) => {
    let current: Element | null = el;
    while (current instanceof HTMLElement) {
      if (current.scrollHeight > current.clientHeight) {
        return current.scrollHeight;
      }
      current = current.parentElement;
    }
    return document.documentElement.scrollHeight;
  });
  await page.setViewportSize({
    width: originalSize?.width ?? 1280,
    height: fullHeight,
  });
  const screenshot = await target.screenshot();
  if (originalSize) {
    await page.setViewportSize(originalSize);
  }
  return screenshot;
}
