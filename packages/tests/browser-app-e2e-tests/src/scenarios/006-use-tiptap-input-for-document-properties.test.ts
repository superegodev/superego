import { DataType } from "@superego/schema";
import { test } from "../fixture.js";
import createCollection from "../routines/createCollection.js";

test("006. Use TipTap input for document properties", async ({
  page,
  ai,
  aiTap,
  aiInput,
  aiAssert,
  aiWaitFor,
}) => {
  // Setup: create collection with a TipTap JsonObject property.
  const collectionId = await createCollection(page, {
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
      contentBlockingKeysGetter: null,
      contentSummaryGetter: {
        source: "",
        compiled:
          "export default function getContentSummary() { return {}; }",
      },
    },
  });

  await test.step("00. Navigate to collection page", async () => {
    // Exercise
    await page.goto(`/collections/${collectionId}`);
    await aiWaitFor("the collection page is loaded with a create document link or button");

    // Verify
    await aiAssert(
      "an empty Notes collection page with a create document button in the top right",
    );
  });

  await test.step("01. Go to new document page", async () => {
    // Exercise
    await aiTap("Create document button");
    await aiWaitFor("a form with a Notes rich text field is shown");

    // Verify
    await aiAssert(
      'a form with a "Notes" rich text field and a disabled Create button',
    );
  });

  const plainWord = "solstice";

  await test.step("02. Fill TipTap input with rich text content", async () => {
    // Exercise
    await aiInput(
      `Expedition Log

Welcome to the northbound research notes.

Objectives
- Capture dawn photos
- Verify backup batteries
- Review tide tables

Useful links
Trail map: https://example.com/trail-map
Weather station: https://example.com/weather

Keep the left ridge in sight after the old bridge.

The keyword ${plainWord} should remain plain text.`,
      "Notes rich text field",
    );
    await page.waitForTimeout(500);

    // Verify
    await aiAssert(
      'the "Notes" rich text field contains text content including "Expedition Log" and other content',
    );
  });

  await test.step("03. Select a plain word with no markup", async () => {
    // Exercise
    await ai(
      `double-click on the word "${plainWord}" in the Notes rich text field to select it`,
    );
    await page.waitForTimeout(100);

    // Verify
    await aiAssert(
      `the word "${plainWord}" is selected in the Notes rich text field`,
    );
  });

  await test.step("04. Apply bold markup using toolbar", async () => {
    // Exercise
    await aiTap("Bold button in the toolbar");
    await page.waitForTimeout(100);

    // Verify
    await aiAssert(
      `the word "${plainWord}" is bold in the Notes rich text field`,
    );
  });

  await test.step("05. Remove bold markup using toolbar", async () => {
    // Exercise
    await aiTap("Bold button in the toolbar");
    await page.waitForTimeout(100);

    // Verify
    await aiAssert(
      `the word "${plainWord}" is not bold in the Notes rich text field`,
    );
  });

  await test.step("06. Apply bold markup using keyboard shortcut", async () => {
    // Exercise
    await ai(
      `select the word "${plainWord}" in the Notes rich text field by double-clicking it, then press Ctrl+B`,
    );
    await page.waitForTimeout(100);

    // Verify
    await aiAssert(
      `the word "${plainWord}" is bold in the Notes rich text field`,
    );
  });

  await test.step("07. Remove bold markup using keyboard shortcut", async () => {
    // Exercise
    await ai(
      `select the word "${plainWord}" in the Notes rich text field by double-clicking it, then press Ctrl+B`,
    );
    await page.waitForTimeout(100);

    // Verify
    await aiAssert(
      `the word "${plainWord}" is not bold in the Notes rich text field`,
    );
  });
});
