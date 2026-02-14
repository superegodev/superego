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
  aiTap,
  aiAssert,
}) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean((window as any).backend));

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
        compiled: "export default function getContentSummary() { return {}; }",
      },
    },
  });

  await page.goto(`/collections/${collectionId}`);
  await aiTap("Create document");
  await aiTap("place one marker on the GeoJSON map");
  await aiAssert("GeoJSON map has exactly one marker");
});
