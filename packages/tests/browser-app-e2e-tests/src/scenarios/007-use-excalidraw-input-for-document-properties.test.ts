import { DataType } from "@superego/schema";
import { test } from "../fixture.js";
import createCollection from "../routines/createCollection.js";

test("007. Use Excalidraw input for document properties", async ({
  page,
  aiTap,
  aiAssert,
}) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean((window as any).backend));

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
        compiled: "export default function getContentSummary() { return {}; }",
      },
    },
  });

  await page.goto(`/collections/${collectionId}`);
  await aiTap("Create document");
  await aiTap("draw an empty circle in the Excalidraw canvas");
  await aiAssert("Excalidraw canvas contains one empty circle");
});
