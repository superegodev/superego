import openSidebar from "../actions/openSidebar.js";
import setActiveMonacoEditorValue from "../actions/setActiveMonacoEditorValue.js";
import monacoEditorContent from "../locators/monacoEditorContent.js";
import test from "../test.js";
import VisualEvaluator from "../VisualEvaluator.js";

test("010. Create collection manually", async ({ page }) => {
  await test.step("00. Navigate to Create Collection (Manual) page", async () => {
    // Exercise
    await page.goto("/");
    await openSidebar(page);
    await page.getByRole("link", { name: /^Create collection$/i }).click();
    await page.getByRole("link", { name: /Go to manual mode/i }).click();
    await page.getByRole("tab", { name: /General settings/i }).waitFor();
    // Wait for the lazily-loaded markdown fields to be ready.
    await page.getByLabel(/^Description$/i).waitFor();
    await page.getByLabel(/^Assistant instructions$/i).waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "00.png",
      page,
      "General settings tab with empty Icon, Name, Description, Assistant instructions fields and an off Redirect toggle",
    );
  });

  await test.step("01. Fill in general settings", async () => {
    // Exercise
    await page.getByRole("textbox", { name: /^Name$/i }).fill("Notes");
    await page
      .getByLabel(/^Description$/i)
      .fill("A personal collection of short notes.");
    await page
      .getByLabel(/^Assistant instructions$/i)
      .fill("When the user asks about notes, use this collection.");
    await page
      .getByText(/Redirect to collection after document creation/i)
      .click();

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      page,
      'General settings tab with Name "Notes", Description and Assistant instructions filled, Redirect toggle on',
    );
  });

  await test.step("02. Set schema", async () => {
    // Exercise
    await page.getByRole("tab", { name: /Schema/i }).click();
    await monacoEditorContent(page).first().waitFor();
    await setActiveMonacoEditorValue(page, notesSchema);

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      page,
      "Schema tab with a Note struct schema containing title and body (Markdown) properties",
    );
  });

  await test.step("03. Customize deduplication getter", async () => {
    // Exercise
    await page.getByRole("tab", { name: /Deduplication/i }).click();
    await monacoEditorContent(page).first().waitFor();
    await setActiveMonacoEditorValue(page, contentBlockingKeysGetterSource);

    // Verify
    await VisualEvaluator.expectToSee(
      "03.png",
      page,
      "Deduplication tab with Enable deduplication on and a getContentBlockingKeys function using note.title",
    );
  });

  await test.step("04. Customize content summary getter", async () => {
    // Exercise
    await page.getByRole("tab", { name: /Content summary/i }).click();
    await monacoEditorContent(page).first().waitFor();
    await setActiveMonacoEditorValue(page, contentSummaryGetterSource);

    // Verify
    await VisualEvaluator.expectToSee(
      "04.png",
      page,
      "Content summary tab with a getContentSummary function returning Title, and a Create button",
    );
  });

  await test.step("05. Create collection", async () => {
    // Exercise
    await page.getByRole("button", { name: /^Create$/i }).click();
    await page.getByRole("link", { name: /Create document/i }).waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "05.png",
      page,
      "empty Notes collection page with a Title column and a create document icon button (top right)",
    );
  });
});

const notesSchema = `
{
  "types": {
    "Note": {
      "dataType": "Struct",
      "properties": {
        "title": { "dataType": "String" },
        "body": {
          "dataType": "String",
          "format": "dev.superego:String.Markdown"
        }
      }
    }
  },
  "rootType": "Note"
}
`.trim();

const contentBlockingKeysGetterSource = `
import type { Note } from "./CollectionSchema.js";

export default function getContentBlockingKeys(note: Note): string[] {
  return [\`title:\${note.title.trim().toLowerCase()}\`];
}
`.trim();

const contentSummaryGetterSource = `
import type { Note } from "./CollectionSchema.js";

export default function getContentSummary(
  note: Note,
): Record<string, string | number | boolean | null> {
  return {
    "{position:0,sortable:true,default-sort:asc} Title": note.title,
  };
}
`.trim();
