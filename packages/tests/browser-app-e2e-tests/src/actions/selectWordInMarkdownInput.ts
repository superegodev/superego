import type { Page } from "@playwright/test";
import markdownInput from "../locators/markdownInput.js";

export default async function selectWordInMarkdownInput(
  page: Page,
  word: string,
) {
  await markdownInput(page).evaluate((node, selectedWord) => {
    const textarea = node as HTMLTextAreaElement;
    const start = textarea.value.indexOf(selectedWord);
    if (start < 0) {
      throw new Error(`Word "${selectedWord}" not found in markdown input`);
    }
    textarea.focus();
    textarea.setSelectionRange(start, start + selectedWord.length);
    textarea.dispatchEvent(new Event("select", { bubbles: true }));
    document.dispatchEvent(new Event("selectionchange"));
  }, word);
}
