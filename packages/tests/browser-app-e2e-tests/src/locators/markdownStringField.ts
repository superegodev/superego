import type { Locator, Page } from "@playwright/test";

export default function markdownStringField(page: Page): Locator {
  return page.getByTestId("widgets.RHFContentField.StringField.Markdown.root");
}
