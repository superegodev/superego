import { test } from "@playwright/test";

export default test.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      const hideTooltips = () => {
        const style = document.createElement("style");
        style.textContent = `[role="tooltip"] { display: none !important; }`;
        document.head.appendChild(style);
      };
      if (document.head) {
        hideTooltips();
      } else {
        document.addEventListener("DOMContentLoaded", hideTooltips);
      }
    });
    await use(page);
  },
});
