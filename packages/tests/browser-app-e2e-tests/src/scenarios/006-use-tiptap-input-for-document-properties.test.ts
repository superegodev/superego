import test from "@playwright/test";
import { DataType } from "@superego/schema";
import selectWordInTiptapInput from "../actions/selectWordInTiptapInput.js";
import waitForTiptapRichTextJsonObjectField from "../actions/waitForTiptapRichTextJsonObjectField.js";
import mainPanel from "../locators/mainPanel.js";
import tiptapRichTextJsonObjectField from "../locators/tiptapRichTextJsonObjectField.js";
import createCollection from "../routines/createCollection.js";
import VisualEvaluator from "../VisualEvaluator.js";

test("006. Use TipTap input for document properties", async ({ page }) => {
  await test.step("00. Create collection with Tiptap JsonObject property", async () => {
    // Exercise
    await createCollection(page, {
      settings: {
        name: "Notes",
        icon: null,
        collectionCategoryId: null,
        defaultCollectionViewAppId: null,
        description: null,
        assistantInstructions: null,
      },
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              notes: {
                dataType: DataType.JsonObject,
                format: "dev.superego:JsonObject.TiptapRichText",
              },
            },
          },
        },
        rootType: "Root",
      },
      versionSettings: {
        defaultDocumentLayoutOptions: null,
        contentBlockingKeysGetter: null,
        contentSummaryGetter: {
          source: "",
          compiled:
            "export default function getContentSummary() { return {}; }",
        },
      },
    });

    // Verify
    await VisualEvaluator.expectToSee(
      "00.png",
      page,
      "empty Notes collection page, create document icon button (top right)",
    );
  });

  await test.step("01. Go to new document page", async () => {
    // Exercise
    await page.getByRole("link", { name: /Create document/i }).click();
    await page.getByRole("button", { name: /^Create$/i }).waitFor();
    await waitForTiptapRichTextJsonObjectField(page);

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      page,
      'form with a "Notes" rich text field and disabled Create button',
    );
  });

  const plainWord = "solstice";

  await test.step("02. Fill Tiptap input with rich text content", async () => {
    // Exercise
    await tiptapRichTextJsonObjectField(page)
      .locator(".ProseMirror")
      .fill(
        `
Expedition Log

Welcome to the northbound research notes.

Objectives
- Capture dawn photos
- Verify backup batteries
- Review tide tables

Useful links
Trail map: https://example.com/trail-map
Weather station: https://example.com/weather

Keep the left ridge in sight after the old bridge.

The keyword ${plainWord} should remain plain text.
        `.trim(),
      );
    // Wait for debounce on Tiptap input updates.
    await page.waitForTimeout(500);

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      page,
      'form with a "Notes" rich text field containing one page of content',
    );
  });

  await test.step("03. Select a plain word with no markup", async () => {
    // Exercise
    await selectWordInTiptapInput(page, plainWord);
    await page.waitForTimeout(100);

    // Verify
    await VisualEvaluator.expectToSee(
      "03.png",
      page,
      `form with a "Notes" rich text field, word "${plainWord}" selected`,
    );
  });

  await test.step("04. Apply bold markup using toolbar", async () => {
    // Exercise
    await mainPanel(page)
      .getByRole("button", { name: /^Bold$/i })
      .click();
    await page.waitForTimeout(100);

    // Verify
    await VisualEvaluator.expectToSee(
      "04.png",
      page,
      `form with a "Notes" rich text field, word "${plainWord}" selected and bold`,
    );
  });

  await test.step("05. Remove bold markup using toolbar", async () => {
    // Exercise
    await mainPanel(page)
      .getByRole("button", { name: /^Bold$/i })
      .click();
    await page.waitForTimeout(100);

    // Verify
    await VisualEvaluator.expectToSee(
      "05.png",
      page,
      `form with a "Notes" rich text field, word "${plainWord}" selected and not bold`,
    );
  });

  await test.step("06. Apply bold markup using Cmd/Ctrl+B", async () => {
    // Exercise
    await tiptapRichTextJsonObjectField(page)
      .locator(".ProseMirror")
      .press("ControlOrMeta+B");
    await page.waitForTimeout(100);

    // Verify
    await VisualEvaluator.expectToSee(
      "06.png",
      page,
      `form with a "Notes" rich text field, word "${plainWord}" selected and bold`,
    );
  });

  await test.step("07. Remove bold markup using Cmd/Ctrl+B", async () => {
    // Exercise
    await selectWordInTiptapInput(page, plainWord);
    await tiptapRichTextJsonObjectField(page)
      .locator(".ProseMirror")
      .press("ControlOrMeta+B");
    await page.waitForTimeout(100);

    // Verify
    await VisualEvaluator.expectToSee(
      "07.png",
      page,
      `form with a "Notes" rich text field, word "${plainWord}" selected and not bold`,
    );
  });
});
