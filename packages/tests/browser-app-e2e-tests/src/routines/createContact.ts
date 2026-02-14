import type { Page } from "@playwright/test";

export default async function createContact(
  page: Page,
  input: {
    collectionId: string;
    name: string;
    relation: string;
    number: string;
    address: string;
    notes: string;
  },
): Promise<string> {
  return page.evaluate(async (contactInput) => {
    const backend = (window as any).backend;
    const result = await backend.documents.create({
      collectionId: contactInput.collectionId,
      content: {
        name: contactInput.name,
        relation: contactInput.relation,
        number: contactInput.number,
        address: contactInput.address,
        notes: contactInput.notes,
      },
    });

    if (!result.success) {
      throw new Error(JSON.stringify(result.error));
    }

    return result.data.id as string;
  }, input);
}
