import type { Page } from "@playwright/test";
import openSidebar from "../actions/openSidebar.js";
import waitForTiptapRichTextJsonObjectField from "../actions/waitForTiptapRichTextJsonObjectField.js";
import tiptapRichTextJsonObjectField from "../locators/tiptapRichTextJsonObjectField.js";

/**
 * Creates a document in the Contacts collection.
 *
 * Starts: anywhere.
 * Ends: newly-created Contact document page.
 */
export default async function createContact(
  page: Page,
  contact: {
    name: string;
    relation: string;
    number: string;
    address: string;
    notes: string;
  },
) {
  // Go to the Contacts collection page.
  await openSidebar(page);
  await page.getByRole("row", { name: /Productivity/i }).click();
  await page.getByRole("row", { name: /Contacts/i }).click();

  // Go to the documents creation page.
  await page.getByRole("link", { name: /Create document/i }).click();
  await waitForTiptapRichTextJsonObjectField(page);

  // Fill-in the form.
  await page.getByLabel(/^Type/i).click();
  await page.getByRole("option", { name: /Person/i }).click();
  await page.getByRole("textbox", { name: /^Name/i }).fill(contact.name);
  await page
    .getByRole("textbox", { name: /^Relation/i })
    .fill(contact.relation);
  await page.getByRole("textbox", { name: /^Number/i }).fill(contact.number);
  await page.getByRole("textbox", { name: /^Address/i }).fill(contact.address);
  await tiptapRichTextJsonObjectField(page)
    .locator(".ProseMirror")
    .fill(contact.notes);
  // Wait for the debounce on the TipTap input.
  await page.waitForTimeout(500);

  // Create the document.
  await page.getByRole("button", { name: /^Create$/i }).click();

  // Wait to be on the newly created Contact document page.
  await page.getByRole("button", { name: /^Save$/i }).waitFor();
  await waitForTiptapRichTextJsonObjectField(page);
}
