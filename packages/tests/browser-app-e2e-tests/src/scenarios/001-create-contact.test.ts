import { DataType } from "@superego/schema";
import { test } from "../fixture.js";
import createCollection from "../routines/createCollection.js";

test("001. Create Contact", async ({ page, aiTap, aiInput, aiAssert }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean((window as any).backend));

  const collectionId = await createCollection(page, {
    settings: {
      name: "Contacts",
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
            name: { dataType: DataType.String },
            relation: { dataType: DataType.String },
            number: { dataType: DataType.String },
            address: { dataType: DataType.String },
            notes: { dataType: DataType.String },
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
  await aiInput("Carl Jung", "Name field");
  await aiInput("Protégé", "Relation field");
  await aiInput("+41 44 123 45 67", "Number field");
  await aiInput("carl@jung.ch", "Address field");
  await aiInput("Ambitious. Watch his drift toward mysticism.", "Notes field");
  await aiTap("Create");

  await aiAssert("contact detail page for Carl Jung is visible");
});
