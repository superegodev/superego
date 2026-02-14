import { DataType } from "@superego/schema";
import { test } from "../fixture.js";
import createCollection from "../routines/createCollection.js";

test("005. Use markdown input for document properties", async ({
  page,
  aiTap,
  aiInput,
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
              dataType: DataType.String,
              format: "dev.superego:String.Markdown",
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

  const plainWord = "solstice";
  await page.goto(`/collections/${collectionId}`);
  await aiTap("Create document");
  await aiInput(
    `# Expedition Log\n\nThe keyword ${plainWord} should remain plain text.`,
    "Notes field",
  );
  await aiTap(`select the word ${plainWord} in the Notes field`);
  await aiTap("Bold");
  await aiAssert(`the selected word ${plainWord} is bold in the markdown editor`);

  await aiTap("Bold");
  await aiAssert(`the selected word ${plainWord} is not bold in the markdown editor`);
});
