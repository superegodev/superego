import { DataType } from "@superego/schema";
import { test } from "../fixture.js";
import createCollection from "../routines/createCollection.js";

test.use({
  launchOptions: {
    args: [
      "--disable-vulkan",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  },
});

test("008. Use GeoJSON input for document properties", async ({
  page,
  ai,
  aiTap,
  aiAssert,
  aiWaitFor,
}) => {
  // Setup: create collection with a GeoJSON JsonObject property.
  const collectionId = await createCollection(page, {
    settings: {
      name: "Places",
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
            location: {
              dataType: DataType.JsonObject,
              format: "dev.superego:JsonObject.GeoJSON",
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
      "an empty Places collection page with a create document button in the top right",
    );
  });

  await test.step("01. Go to new document page", async () => {
    // Exercise
    await aiTap("Create document button");
    await aiWaitFor("a form with a GeoJSON map field is shown");

    // Verify
    await aiAssert(
      'a create document form with a "Location" GeoJSON map field and a Create button',
    );
  });

  await test.step("02. Draw point on GeoJSON map", async () => {
    // Exercise
    await aiTap("Marker button on the map controls");
    await ai("click on the map canvas to place a marker point");
    await page.waitForTimeout(500);

    // Verify
    await aiAssert(
      'the "Location" GeoJSON map field shows one marker on the map',
    );
  });
});
