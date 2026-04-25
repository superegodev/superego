import { test } from "@playwright/test";

export default test.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      const injectStyles = () => {
        const style = document.createElement("style");
        style.textContent = `
          [role="tooltip"] { display: none !important; }
          [class*="CompilationInProgressIndicator"] { display: none !important; }
        `;
        document.head.appendChild(style);
      };
      if (document.head) {
        injectStyles();
      } else {
        document.addEventListener("DOMContentLoaded", injectStyles);
      }
    });
    await use(page);
  },
});
