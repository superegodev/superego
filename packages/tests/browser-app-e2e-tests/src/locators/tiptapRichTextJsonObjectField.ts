import type { Locator, Page } from "@playwright/test";

export default function tiptapRichTextJsonObjectField(page: Page): Locator {
  return page.getByTestId(
    "widgets.RHFContentField.JsonObjectField.TiptapRichText.root",
  );
}
