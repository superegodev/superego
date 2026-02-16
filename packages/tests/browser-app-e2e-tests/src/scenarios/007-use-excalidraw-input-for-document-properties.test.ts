import test from "@playwright/test";
import { DataType } from "@superego/schema";
import drawTextInExcalidrawInput from "../actions/drawTextInExcalidrawInput.js";
import waitForExcalidrawJsonObjectField from "../actions/waitForExcalidrawJsonObjectField.js";
import createCollection from "../routines/createCollection.js";
import VisualEvaluator from "../VisualEvaluator.js";

test("007. Use Excalidraw input for document properties", async ({ page }) => {
  await test.step("00. Create collection with Excalidraw JsonObject property", async () => {
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
                format: "dev.superego:JsonObject.ExcalidrawDrawing",
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
        defaultDocumentViewUiOptions: null,
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
    await waitForExcalidrawJsonObjectField(page);

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      page,
      'form with a "Notes" drawing field and disabled Create button',
    );
  });

  await test.step("02. Draw 'Hello world!' text in Excalidraw", async () => {
    // Exercise
    await drawTextInExcalidrawInput(page);

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      page,
      'Excalidraw input with "Hello world!" text drawn on the canvas',
    );
  });
});
