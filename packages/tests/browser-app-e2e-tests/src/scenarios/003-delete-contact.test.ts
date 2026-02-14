import { DataType } from "@superego/schema";
import { test } from "../fixture.js";
import createCollection from "../routines/createCollection.js";
import createContact from "../routines/createContact.js";

test("003. Delete Contact", async ({
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

  await test.step("01. Open delete document modal", async () => {
    // Exercise
    await aiTap("Delete document button");
    await aiWaitFor("a dialog or modal is visible");

    // Verify
    await aiAssert(
      "a delete document confirmation modal is shown with a command confirmation input and a Delete button",
    );
  });

  await test.step("02. Type wrong confirmation text", async () => {
    // Exercise
    await aiInput("delet", "command confirmation text field");
    await aiTap("Delete button inside the dialog or modal");
    await aiWaitFor("a validation error is visible");

    // Verify
    await aiAssert(
      "the delete document modal shows a command confirmation input with value 'delet' and a validation error",
    );
  });

  await test.step("03. Type exact confirmation text", async () => {
    // Exercise
    await aiInput("delete", "command confirmation text field", {
      mode: "replace",
    });

    // Verify
    await aiAssert(
      "the delete document modal shows a command confirmation input with value 'delete' and no validation errors",
    );
  });

  await test.step("04. Confirm deletion and return to empty collection", async () => {
    // Exercise
    await aiTap("Delete button inside the dialog or modal");
    await aiWaitFor("the text 'This collection doesn't have any documents yet.' is visible");

    // Verify
    await aiAssert(
      "an empty Contacts collection table with no documents",
    );
  });

  await test.step("05. Reload and verify same state", async () => {
    // Exercise
    await page.reload();
    await aiWaitFor("the text 'This collection doesn't have any documents yet.' is visible");

    // Verify
    await aiAssert(
      "an empty Contacts collection table with no documents",
    );
  });
});
