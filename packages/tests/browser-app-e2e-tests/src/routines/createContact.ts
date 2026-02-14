import type { Page } from "@playwright/test";

/**
 * Programmatically creates a document in a Contacts collection via the
 * in-browser backend API.
 *
 * Returns the new document's ID. Does not navigate.
 */
export default async function createContact(
  page: Page,
  collectionId: string,
  contact: {
    type: "Person" | "Organization";
    name: string;
    relation: string | null;
    phones: Array<{ number: string; description: string | null }>;
    emails: Array<{ address: string; description: string | null }>;
    notes: unknown | null;
  },
): Promise<string> {
  // Ensure the browser app is loaded so the in-browser backend is available.
  await page.goto("/");
  await page.waitForFunction(() => Boolean((window as any).backend));

  // Programmatically create the document.
  return page.evaluate(
    async ({ collectionId, content }) => {
      const backend = (window as any).backend;
      const result = await backend.documents.create({ collectionId, content });
      if (!result.success) {
        throw new Error(JSON.stringify(result.error));
      }
      return result.data.id as string;
    },
    { collectionId, content: contact },
  );
}
