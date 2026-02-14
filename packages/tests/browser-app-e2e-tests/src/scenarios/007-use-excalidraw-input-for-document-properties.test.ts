import { DataType } from "@superego/schema";
import { test } from "../fixture.js";
import createCollection from "../routines/createCollection.js";

test("007. Use Excalidraw input for document properties", async ({
  page,
  ai,
  aiTap,
  aiAssert,
  aiWaitFor,
}) => {
  // Setup: create collection with an Excalidraw JsonObject property.
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
    await aiWaitFor("a form with an Excalidraw drawing field is shown");

    // Verify
    await aiAssert(
      'a form with a "Notes" drawing field (Excalidraw canvas) and a disabled Create button',
    );
  });

  await test.step("02. Draw a circle in Excalidraw", async () => {
    // Exercise
    await aiTap("Ellipse tool in the Excalidraw toolbar");
    await ai(
      "click and drag on the Excalidraw canvas to draw a circle shape in the center of the canvas",
    );
    await page.waitForTimeout(600);

    // Verify
    await aiAssert(
      "the Excalidraw canvas shows a drawn shape (circle or ellipse)",
    );
  });
});
