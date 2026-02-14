import type { Page } from "@playwright/test";
import tiptapRichTextJsonObjectField from "../locators/tiptapRichTextJsonObjectField.js";

export default async function selectWordInTiptapInput(
  page: Page,
  word: string,
) {
  await tiptapRichTextJsonObjectField(page)
    .locator(".ProseMirror")
    .evaluate((node, selectedWord) => {
      const root = node as HTMLElement;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

      let foundNode: Text | null = null;
      let startOffset = -1;

      for (let currentNode = walker.nextNode(); currentNode; ) {
        const textNode = currentNode as Text;
        const index = textNode.data.indexOf(selectedWord);
        if (index >= 0) {
          foundNode = textNode;
          startOffset = index;
          break;
        }
        currentNode = walker.nextNode();
      }

      if (!foundNode || startOffset < 0) {
        throw new Error(`Word "${selectedWord}" not found in Tiptap input`);
      }

      const selection = window.getSelection();
      if (!selection) {
        throw new Error("Selection API not available");
      }

      root.focus();

      const range = document.createRange();
      range.setStart(foundNode, startOffset);
      range.setEnd(foundNode, startOffset + selectedWord.length);
      selection.removeAllRanges();
      selection.addRange(range);

      document.dispatchEvent(new Event("selectionchange"));
    }, word);
}
