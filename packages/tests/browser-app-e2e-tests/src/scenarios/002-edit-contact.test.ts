import { DataType } from "@superego/schema";
import { test } from "../fixture.js";
import createCollection from "../routines/createCollection.js";
import createContact from "../routines/createContact.js";

test("002. Edit Contact", async ({ page, aiTap, aiInput, aiAssert }) => {
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

  const contactId = await createContact(page, {
    collectionId,
    name: "Carl Jung",
    relation: "Protégé",
    number: "+41 44 123 45 67",
    address: "carl@jung.ch",
    notes: "Ambitious. Watch his drift toward mysticism.",
  });

  await page.goto(`/collections/${collectionId}/documents/${contactId}`);
  await aiInput("Colleague", "Relation field");
  await aiTap("Save");

  await page.reload();
  await aiAssert("Relation field shows Colleague");
});
