import { DataType } from "@superego/schema";
import { test } from "../fixture.js";
import createCollection from "../routines/createCollection.js";

test("001. Create Contact", async ({
  page,
  aiTap,
  aiInput,
  aiAssert,
  aiWaitFor,
}) => {
  // Setup: create Contacts collection programmatically.
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

  await test.step("00. Navigate to collection page", async () => {
    // Exercise
    await page.goto(`/collections/${collectionId}`);
    await aiWaitFor("the collection page is loaded with a create document link or button");

    // Verify
    await aiAssert(
      "an empty Contacts collection page with a create document button in the top right",
    );
  });

  await test.step("01. Navigate to create Contact page", async () => {
    // Exercise
    await aiTap("Create document button");
    await aiWaitFor("a form to create a new document is shown with a Create button");

    // Verify
    await aiAssert(
      "a create Contact form is shown with fields for Type, Name, Relation, and a disabled Create button",
    );
  });

  await test.step("02. Fill Contact details", async () => {
    // Exercise
    await aiTap("Type dropdown or select");
    await aiTap("Person option");
    await aiInput("Carl Jung", "Name text field");
    await aiInput("Protégé", "Relation text field");
    await aiInput("+41 44 123 45 67", "Number text field");
    await aiInput("carl@jung.ch", "Address text field");
    await aiInput(
      "Ambitious. Watch his drift toward mysticism.",
      "Notes rich text field",
    );
    await page.waitForTimeout(500);

    // Verify
    await aiAssert(
      "the contact form is filled with Carl Jung details: Name is 'Carl Jung', Relation is 'Protégé'",
    );
  });

  await test.step("03. Create contact", async () => {
    // Exercise
    await aiTap("Create button");
    await aiWaitFor("a Save button is visible, indicating the document was created");

    // Verify
    await aiAssert(
      "the contact detail page for Carl Jung is shown with a disabled Save button in the top right",
    );
  });
});
