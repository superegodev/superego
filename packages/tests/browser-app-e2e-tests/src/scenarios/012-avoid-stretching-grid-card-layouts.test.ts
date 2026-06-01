import type { Page } from "@playwright/test";
import test from "../test.js";
import VisualEvaluator from "../VisualEvaluator.js";

test("012. Avoid stretching Grid card layouts", async ({ page }) => {
  await test.step("00. Open collection app with fill-height cards", async () => {
    // Exercise
    await createCollectionApp(page, {
      collectionName: "Fill Height Cards",
      appName: "Fill Height Grid Cards",
      appMainModule: fillHeightRowsAppMainModule,
    });
    await page
      .frameLocator("iframe")
      .getByText(/^Grid-row fill-height card$/i)
      .waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "00.png",
      page,
      "Fill Height Cards collection app showing only the row with a taller card stretching its fill-height sibling",
    );
  });

  await test.step("01. Open collection app with regular cards", async () => {
    // Exercise
    await createCollectionApp(page, {
      collectionName: "Regular Cards",
      appName: "Regular Grid Cards",
      appMainModule: regularRowsAppMainModule,
    });
    await page
      .frameLocator("iframe")
      .getByText(/^Regular short card$/i)
      .waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      page,
      "Regular Cards collection app showing regular Tiles staying compact even when a sibling card is taller",
    );
  });

  await test.step("02. Open collection app with one fill-height card", async () => {
    // Exercise
    await createCollectionApp(page, {
      collectionName: "Single Card Layout",
      appName: "Single Fill Height Card",
      appMainModule: singleCardAppMainModule,
    });
    await page
      .frameLocator("iframe")
      .getByText(/^Single fill-height card$/i)
      .waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      page,
      "Single Card Layout collection app showing one fill-height Tile that stays content-sized instead of stretching to the viewport",
    );
  });
});

async function createCollectionApp(
  page: Page,
  options: {
    collectionName: string;
    appName: string;
    appMainModule: AppMainModule;
  },
) {
  await page.goto("/");
  await page.waitForFunction(() => Boolean((window as any).backend));
  const collectionId = await page.evaluate(async (input) => {
    const backend = (window as any).backend;
    const collectionResult = await backend.collections.create({
      settings: {
        name: input.collectionName,
        icon: null,
        collectionCategoryId: null,
        defaultCollectionViewAppId: null,
        description: null,
        assistantInstructions: null,
        redirectToCollectionAfterDocumentCreation: false,
      },
      schema: {
        types: {
          Card: {
            dataType: "Struct",
            properties: {
              title: { dataType: "String" },
            },
          },
        },
        rootType: "Card",
      },
      versionSettings: {
        contentBlockingKeysGetter: null,
        contentSummaryGetter: {
          source: "",
          compiled:
            "export default function getContentSummary() { return {}; }",
        },
        defaultDocumentViewUiOptions: null,
      },
    });
    if (!collectionResult.success) {
      throw new Error(JSON.stringify(collectionResult.error));
    }

    const appResult = await backend.apps.create({
      type: "CollectionView",
      name: input.appName,
      targetCollectionIds: [collectionResult.data.id],
      files: {
        "/main.tsx": input.appMainModule,
      },
    });
    if (!appResult.success) {
      throw new Error(JSON.stringify(appResult.error));
    }

    const updateResult = await backend.collections.updateSettings(
      collectionResult.data.id,
      { defaultCollectionViewAppId: appResult.data.id },
    );
    if (!updateResult.success) {
      throw new Error(JSON.stringify(updateResult.error));
    }

    return collectionResult.data.id;
  }, options);
  await page.goto(`/collections/${collectionId}`);
}

interface AppMainModule {
  source: string;
  compiled: string;
}

const fillHeightRowsAppMainModule = {
  source: `
import React from "react";
import { Grid, Text, Tile } from "@superego/app-sandbox/components";

export default function App(): React.ReactElement {
  return (
    <Grid>
      <Grid.Col span={{ sm: 12, md: 6, lg: 6 }}>
        <Tile fillHeight>
          <Text element="h2" size="lg" weight="semibold">
            Grid-row fill-height card
          </Text>
          <Text element="p" color="secondary">
            This fills the height of the taller card in the same row.
          </Text>
        </Tile>
      </Grid.Col>
      <Grid.Col span={{ sm: 12, md: 6, lg: 6 }}>
        <Tile fillHeight>
          <Text element="h2" size="lg" weight="semibold">
            Tall grid-row card
          </Text>
          <Text element="p" color="secondary">
            This card has enough content to be visibly taller than its sibling.
          </Text>
          <ul>
            <li>Water when the top layer is dry.</li>
            <li>Rotate weekly for even light.</li>
            <li>Mist leaves during dry weeks.</li>
            <li>Check roots before repotting.</li>
            <li>Clean leaves monthly.</li>
          </ul>
        </Tile>
      </Grid.Col>
      <Grid.Col span={{ sm: 12, md: 6, lg: 6 }}>
        <Tile fillHeight>
          <Text element="h2" size="lg" weight="semibold">
            Next-row fill-height card
          </Text>
          <Text element="p" color="secondary">
            This row has no tall sibling, so it stays compact.
          </Text>
        </Tile>
      </Grid.Col>
      <Grid.Col span={{ sm: 12, md: 6, lg: 6 }}>
        <Tile fillHeight>
          <Text element="h2" size="lg" weight="semibold">
            Next-row sibling card
          </Text>
          <Text element="p" color="secondary">
            This is also compact.
          </Text>
        </Tile>
      </Grid.Col>
    </Grid>
  );
}
  `.trim(),
  compiled: `
import React from "react";
import { Grid, Text, Tile } from "@superego/app-sandbox/components";

export default function App() {
  return React.createElement(
    Grid,
    null,
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6, lg: 6 } },
      React.createElement(
        Tile,
        { fillHeight: true },
        React.createElement(
          Text,
          { element: "h2", size: "lg", weight: "semibold" },
          "Grid-row fill-height card",
        ),
        React.createElement(
          Text,
          { element: "p", color: "secondary" },
          "This fills the height of the taller card in the same row.",
        ),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6, lg: 6 } },
      React.createElement(
        Tile,
        { fillHeight: true },
        React.createElement(
          Text,
          { element: "h2", size: "lg", weight: "semibold" },
          "Tall grid-row card",
        ),
        React.createElement(
          Text,
          { element: "p", color: "secondary" },
          "This card has enough content to be visibly taller than its sibling.",
        ),
        React.createElement(
          "ul",
          null,
          React.createElement("li", null, "Water when the top layer is dry."),
          React.createElement("li", null, "Rotate weekly for even light."),
          React.createElement("li", null, "Mist leaves during dry weeks."),
          React.createElement("li", null, "Check roots before repotting."),
          React.createElement("li", null, "Clean leaves monthly."),
        ),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6, lg: 6 } },
      React.createElement(
        Tile,
        { fillHeight: true },
        React.createElement(
          Text,
          { element: "h2", size: "lg", weight: "semibold" },
          "Next-row fill-height card",
        ),
        React.createElement(
          Text,
          { element: "p", color: "secondary" },
          "This row has no tall sibling, so it stays compact.",
        ),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6, lg: 6 } },
      React.createElement(
        Tile,
        { fillHeight: true },
        React.createElement(
          Text,
          { element: "h2", size: "lg", weight: "semibold" },
          "Next-row sibling card",
        ),
        React.createElement(
          Text,
          { element: "p", color: "secondary" },
          "This is also compact.",
        ),
      ),
    ),
  );
}
  `.trim(),
};

const regularRowsAppMainModule = {
  source: `
import React from "react";
import { Grid, Text, Tile } from "@superego/app-sandbox/components";

export default function App(): React.ReactElement {
  return (
    <Grid>
      <Grid.Col span={{ sm: 12, md: 6, lg: 6 }}>
        <Tile>
          <Text element="h2" size="lg" weight="semibold">
            Regular short card
          </Text>
          <Text element="p" color="secondary">
            One line of content.
          </Text>
        </Tile>
      </Grid.Col>
      <Grid.Col span={{ sm: 12, md: 6, lg: 6 }}>
        <Tile>
          <Text element="h2" size="lg" weight="semibold">
            Regular tall card
          </Text>
          <Text element="p" color="secondary">
            This card is taller by content, not by grid item stretching.
          </Text>
          <ul>
            <li>Water when the top layer is dry.</li>
            <li>Rotate weekly for even light.</li>
            <li>Mist leaves during dry weeks.</li>
            <li>Check roots before repotting.</li>
            <li>Clean leaves monthly.</li>
          </ul>
        </Tile>
      </Grid.Col>
    </Grid>
  );
}
  `.trim(),
  compiled: `
import React from "react";
import { Grid, Text, Tile } from "@superego/app-sandbox/components";

export default function App() {
  return React.createElement(
    Grid,
    null,
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6, lg: 6 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          { element: "h2", size: "lg", weight: "semibold" },
          "Regular short card",
        ),
        React.createElement(Text, { element: "p", color: "secondary" }, "One line of content."),
      ),
    ),
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6, lg: 6 } },
      React.createElement(
        Tile,
        null,
        React.createElement(
          Text,
          { element: "h2", size: "lg", weight: "semibold" },
          "Regular tall card",
        ),
        React.createElement(
          Text,
          { element: "p", color: "secondary" },
          "This card is taller by content, not by grid item stretching.",
        ),
        React.createElement(
          "ul",
          null,
          React.createElement("li", null, "Water when the top layer is dry."),
          React.createElement("li", null, "Rotate weekly for even light."),
          React.createElement("li", null, "Mist leaves during dry weeks."),
          React.createElement("li", null, "Check roots before repotting."),
          React.createElement("li", null, "Clean leaves monthly."),
        ),
      ),
    ),
  );
}
  `.trim(),
};

const singleCardAppMainModule = {
  source: `
import React from "react";
import { Grid, Text, Tile } from "@superego/app-sandbox/components";

export default function App(): React.ReactElement {
  return (
    <Grid>
      <Grid.Col span={{ sm: 12, md: 6, lg: 6 }}>
        <Tile fillHeight>
          <Text element="h2" size="lg" weight="semibold">
            Single fill-height card
          </Text>
          <Text element="p" color="secondary">
            This card should not stretch to fill the viewport.
          </Text>
        </Tile>
      </Grid.Col>
    </Grid>
  );
}
  `.trim(),
  compiled: `
import React from "react";
import { Grid, Text, Tile } from "@superego/app-sandbox/components";

export default function App() {
  return React.createElement(
    Grid,
    null,
    React.createElement(
      Grid.Col,
      { span: { sm: 12, md: 6, lg: 6 } },
      React.createElement(
        Tile,
        { fillHeight: true },
        React.createElement(
          Text,
          { element: "h2", size: "lg", weight: "semibold" },
          "Single fill-height card",
        ),
        React.createElement(
          Text,
          { element: "p", color: "secondary" },
          "This card should not stretch to fill the viewport.",
        ),
      ),
    ),
  );
}
  `.trim(),
};
