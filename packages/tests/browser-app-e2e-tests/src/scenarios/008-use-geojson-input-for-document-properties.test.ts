import test from "@playwright/test";
import { DataType } from "@superego/schema";
import drawPointInGeoJsonInput from "../actions/drawPointInGeoJsonInput.js";
import waitForGeoJSONJsonObjectField from "../actions/waitForGeoJSONJsonObjectField.js";
import createCollection from "../routines/createCollection.js";
import VisualEvaluator from "../VisualEvaluator.js";

test.use({
  launchOptions: {
    args: [
      "--disable-vulkan",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  },
});

test("008. Use GeoJSON input for document properties", async ({ page }) => {
  await test.step("00. Create collection with GeoJSON JsonObject property", async () => {
    // Exercise
    await createCollection(page, {
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

    // Verify
    await VisualEvaluator.expectToSee(
      "00.png",
      page,
      "empty Places collection page, create document icon button (top right)",
    );
  });

  await test.step("01. Go to new document page", async () => {
    // Exercise
    await page.getByRole("link", { name: /Create document/i }).click();
    await waitForGeoJSONJsonObjectField(page);

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      page,
      'create document form with a "Location" GeoJSON map field and Create button',
    );
  });

  await test.step("02. Draw point on GeoJSON map", async () => {
    // Exercise
    await drawPointInGeoJsonInput(page);
    await page.waitForTimeout(500);

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      page,
      'form with a "Location" GeoJSON map field and one marker on the map',
    );
  });
});
