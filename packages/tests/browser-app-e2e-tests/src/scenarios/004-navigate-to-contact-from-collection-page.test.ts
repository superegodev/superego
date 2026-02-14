import { DataType } from "@superego/schema";
import { test } from "../fixture.js";
import createCollection from "../routines/createCollection.js";
import createContact from "../routines/createContact.js";

test("004. Navigate to Contact from collection page", async ({
  page,
  aiTap,
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
        compiled: `export default function getContentSummary(contact) {
  return {
    "{position:0,sortable:true,default-sort:asc} Name": contact.name,
    "{position:1} Relation": contact.relation,
  };
}`,
      },
    },
  });

  await createContact(page, collectionId, {
    type: "Person",
    name: "Carl Jung",
    relation: "Protégé",
    phones: [{ number: "+41 44 123 45 67", description: null }],
    emails: [{ address: "carl@jung.ch", description: null }],
    notes: null,
  });

  await test.step("00. Navigate to Contacts collection page", async () => {
    // Exercise
    await page.goto(`/collections/${collectionId}`);
    await aiWaitFor("a table with a row containing 'Carl Jung' is visible");

    // Verify
    await aiAssert(
      "the Contacts collection table shows a row for Carl Jung",
    );
  });

  await test.step("01. Click on Contact table row", async () => {
    // Exercise
    await aiTap("Carl Jung row in the table");
    await aiWaitFor("a form with a Name text field is shown");

    // Verify
    await aiAssert("the contact detail page for Carl Jung is shown");
  });
});
