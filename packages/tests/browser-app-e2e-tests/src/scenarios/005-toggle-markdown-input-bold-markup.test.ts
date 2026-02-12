import test from "@playwright/test";
import { DataType } from "@superego/schema";
import selectWordInMarkdownInput from "../actions/selectWordInMarkdownInput.js";
import mainPanel from "../locators/mainPanel.js";
import markdownInput from "../locators/markdownInput.js";
import createCollection from "../routines/createCollection.js";
import VisualEvaluator from "../VisualEvaluator.js";

test("005. Toggle markdown input bold markup", async ({ page }) => {
  await test.step("00. Create collection with markdown String property", async () => {
    // Exercise
    await createCollection(page, {
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
          compiled:
            "export default function getContentSummary() { return {}; }",
        },
      },
    });

    // Verify
    await VisualEvaluator.expectToSee(
      "00.png",
      mainPanel(page),
      "empty Notes collection page, create document icon button (top right)",
    );
  });

  await test.step("01. Go to new document page", async () => {
    // Exercise
    await page.getByRole("link", { name: /Create document/i }).click();
    await page.getByRole("button", { name: /^Create$/i }).waitFor();
    await markdownInput(page).waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      mainPanel(page),
      'form with a "Notes" textarea field and disabled Create button',
    );
  });

  const plainWord = "solstice";

  await test.step("02. Fill markdown input with a markdown page", async () => {
    // Exercise
    await markdownInput(page).fill(
      `
# Expedition Log

Welcome to the northbound research notes.

## Objectives
- Capture dawn photos
- Verify backup batteries
- Review tide tables

### Useful links
- [Trail map](https://example.com/trail-map)
- [Weather station](https://example.com/weather)

> Keep the left ridge in sight after the old bridge.

1. Meet the guide
2. Cross the river
3. Set up base camp

\`\`\`bash
echo "checkpoint alpha"
\`\`\`

The keyword ${plainWord} should remain plain text.
      `.trim(),
    );
    await page.waitForTimeout(100);

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      mainPanel(page),
      'form with a "Notes" textarea field, containing markdown content',
    );
  });

  await test.step("03. Select a plain word with no markup", async () => {
    // Exercise
    await selectWordInMarkdownInput(page, plainWord);
    await page.waitForTimeout(100);

    // Verify
    await VisualEvaluator.expectToSee(
      "03.png",
      mainPanel(page),
      `form with a "Notes" textarea field, word "${plainWord}" selected`,
    );
  });

  await test.step("04. Apply bold markup using toolbar", async () => {
    // Exercise
    await mainPanel(page)
      .getByRole("button", { name: /^Bold$/i })
      .click();
    await page.waitForTimeout(100);

    // Verify
    await VisualEvaluator.expectToSee(
      "04.png",
      mainPanel(page),
      `form with a "Notes" textarea field, word "${plainWord}" selected and with bold markup`,
    );
  });

  await test.step("05. Remove bold markup using toolbar", async () => {
    // Exercise
    await mainPanel(page)
      .getByRole("button", { name: /^Bold$/i })
      .click();
    await page.waitForTimeout(100);

    // Verify
    await VisualEvaluator.expectToSee(
      "05.png",
      mainPanel(page),
      `form with a "Notes" textarea field, word "${plainWord}" selected and with no markup`,
    );
  });

  await test.step("06. Apply bold markup using Cmd/Ctrl+B", async () => {
    // Exercise
    await markdownInput(page).press("ControlOrMeta+B");
    await page.waitForTimeout(100);

    // Verify
    await VisualEvaluator.expectToSee(
      "06.png",
      mainPanel(page),
      `form with a "Notes" textarea field, word "${plainWord}" selected and with bold markup`,
    );
  });

  await test.step("07. Remove bold markup using Cmd/Ctrl+B", async () => {
    // Exercise
    await selectWordInMarkdownInput(page, plainWord);
    await markdownInput(page).press("ControlOrMeta+B");
    await page.waitForTimeout(100);

    // Verify
    await VisualEvaluator.expectToSee(
      "07.png",
      mainPanel(page),
      `form with a "Notes" textarea field, word "${plainWord}" selected and with no markup`,
    );
  });
});
