import { DataType } from "@superego/schema";
import { test } from "../fixture.js";
import createCollection from "../routines/createCollection.js";
import createContact from "../routines/createContact.js";

test("002. Edit Contact", async ({
  page,
  aiTap,
  aiInput,
  aiAssert,
  aiWaitFor,
}) => {
  // Setup: create Contacts collection and a Contact document programmatically.
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
        Type: {
          dataType: DataType.Enum,
          members: {
            Person: { value: "Person" },
            Organization: { value: "Organization" },
          },
        },
        Phone: {
          dataType: DataType.Struct,
          properties: {
            number: { dataType: DataType.String },
            description: { dataType: DataType.String },
          },
          nullableProperties: ["description"],
        },
        Email: {
          dataType: DataType.Struct,
          properties: {
            address: { dataType: DataType.String },
            description: { dataType: DataType.String },
          },
          nullableProperties: ["description"],
        },
        Contact: {
          dataType: DataType.Struct,
          properties: {
            type: { dataType: null, ref: "Type" },
            name: { dataType: DataType.String },
            relation: { dataType: DataType.String },
            phones: {
              dataType: DataType.List,
              items: { dataType: null, ref: "Phone" },
            },
            emails: {
              dataType: DataType.List,
              items: { dataType: null, ref: "Email" },
            },
            notes: {
              dataType: DataType.JsonObject,
              format: "dev.superego:JsonObject.TiptapRichText",
            },
          },
          nullableProperties: ["relation", "notes"],
        },
      },
      rootType: "Contact",
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

  const documentId = await createContact(page, collectionId, {
    type: "Person",
    name: "Carl Jung",
    relation: "Protégé",
    phones: [{ number: "+41 44 123 45 67", description: null }],
    emails: [{ address: "carl@jung.ch", description: null }],
    notes: null,
  });

  await test.step("00. Navigate to Contact document page", async () => {
    // Exercise
    await page.goto(
      `/collections/${collectionId}/documents/${documentId}`,
    );
    await aiWaitFor("a form to edit a Contact document is shown");

    // Verify
    await aiAssert(
      "the page shows a form to edit Contact document Carl Jung",
    );
  });

  await test.step("01. Edit relation field", async () => {
    // Exercise
    await aiInput("Colleague", "Relation text field", {
      mode: "replace",
    });

    // Verify
    await aiAssert(
      "the contact detail page shows Relation set to 'Colleague' and an enabled Save button in the top right",
    );
  });

  await test.step("02. Save updated contact", async () => {
    // Exercise
    await aiTap("Save button");
    await page.waitForTimeout(500);

    // Verify
    await aiAssert(
      "the contact detail page shows Relation set to 'Colleague' and a disabled Save button in the top right",
    );
  });

  await test.step("03. Reload page and verify same state", async () => {
    // Exercise
    await page.reload();
    await aiWaitFor("a form to edit a Contact document is shown with Relation field");

    // Verify
    await aiAssert(
      "the contact detail page shows Relation set to 'Colleague' and a disabled Save button in the top right",
    );
  });
});
