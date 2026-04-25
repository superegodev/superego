import type { Page } from "@playwright/test";
import monacoEditorContent from "../locators/monacoEditorContent.js";

/**
 * Sets the value of the Monaco editor whose DOM element currently has focus
 * (or the first one on the page, if none is focused). Bypasses keyboard
 * auto-indent/auto-close quirks by calling `editor.setValue` directly. Relies
 * on the dev entry exposing `window.monaco`.
 */
export default async function setActiveMonacoEditorValue(
  page: Page,
  value: string,
) {
  await monacoEditorContent(page).first().click();
  await page.evaluate((content) => {
    const monaco = (window as any).monaco;
    const editors = monaco.editor.getEditors();
    const editor =
      editors.find((candidate: any) =>
        candidate.getDomNode()?.contains(document.activeElement),
      ) ?? editors[0];
    editor.setValue(content);
    editor.setPosition({ lineNumber: 1, column: 1 });
    editor.setScrollPosition({ scrollTop: 0, scrollLeft: 0 });
  }, value);
  // Move focus out of Monaco so the caret / current-line highlight don't
  // make the resulting screenshot flaky.
  await page.locator("body").click({ position: { x: 0, y: 0 } });
  // Let Monaco finish its async TypeScript semantic highlighting pass and
  // any pending getter-compilation round trip complete.
  await page.waitForTimeout(1500);
}
