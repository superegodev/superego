import { DataType, type Schema } from "@superego/schema";
import openSidebar from "../actions/openSidebar.js";
import setActiveMonacoEditorValue from "../actions/setActiveMonacoEditorValue.js";
import monacoEditorContent from "../locators/monacoEditorContent.js";
import createCollection from "../routines/createCollection.js";
import test from "../test.js";
import VisualEvaluator from "../VisualEvaluator.js";

test("011. Avoid dirty state after reverting collection version schema", async ({
  page,
}) => {
  await test.step("00. Go to the new collection version page", async () => {
    // Exercise
    await createCollection(page, {
      settings: {
        name: "Notes",
        icon: null,
        collectionCategoryId: null,
        defaultCollectionViewAppId: null,
        description: null,
        assistantInstructions: null,
        redirectToCollectionAfterDocumentCreation: false,
      },
      schema: originalSchema,
      versionSettings: {
        contentBlockingKeysGetter: null,
        contentSummaryGetter: {
          source: "",
          compiled:
            "export default function getContentSummary() { return {}; }",
        },
        defaultDocumentViewUiOptions: null,
      },
    });
    await page.getByLabel(/^Settings$/i).click();
    await page.getByRole("tab", { name: /^Create new version$/i }).click();
    await monacoEditorContent(page).first().waitFor();
    // Wait for syntax highlighting.
    await page.waitForTimeout(100);

    // Verify
    await VisualEvaluator.expectToSee(
      "00.png",
      page,
      "Create new collection version page with original Notes schema",
    );
  });

  await test.step("01. Change schema", async () => {
    // Exercise
    await setActiveMonacoEditorValue(page, modifiedSchemaText);

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      page,
      "Create new collection version page with changed Notes schema",
    );
  });

  await test.step("02. Revert it", async () => {
    // Exercise
    await setActiveMonacoEditorValue(page, originalSchemaText);

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      page,
      "Create new collection version page with original Notes schema restored",
    );
  });

  await test.step("03. Navigate away without an unsaved-changes prompt", async () => {
    // Exercise
    page.on("dialog", (dialog) => dialog.dismiss());
    await openSidebar(page);
    await page.getByRole("link", { name: /^Settings$/i }).click();
    await page.getByText("Superego Global Settings").waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "03.png",
      page,
      "Settings page with Inference tab active",
    );
  });
});

const originalSchema = {
  types: {
    Note: {
      dataType: DataType.Struct,
      properties: {
        title: { dataType: DataType.String },
      },
    },
  },
  rootType: "Note",
} satisfies Schema;

const originalSchemaText = JSON.stringify(originalSchema, null, 2);

const modifiedSchemaText = JSON.stringify(
  {
    types: {
      Note: {
        dataType: DataType.Struct,
        properties: {
          title: { dataType: DataType.String },
          body: {
            dataType: DataType.String,
            format: "dev.superego:String.Markdown",
          },
        },
      },
    },
    rootType: "Note",
  },
  null,
  2,
);
