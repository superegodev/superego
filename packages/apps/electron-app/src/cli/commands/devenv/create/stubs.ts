import type { Schema } from "@superego/schema";
import { DataType } from "@superego/schema";

export const collectionSettingsStub = {
  name: "My Collection",
  icon: null,
  description: null,
  assistantInstructions: null,
  defaultCollectionViewAppId: null,
};

export const collectionSchemaStub: Schema = {
  types: {
    Item: {
      dataType: DataType.Struct,
      properties: {},
    },
  },
  rootType: "Item",
};

export function getContentSummaryGetterStub(
  collectionId: string,
  rootType: string,
): string {
  const argName = rootType[0]!.toLowerCase() + rootType.slice(1);
  return [
    `import type { ${rootType} } from "../generated/${collectionId}.js";`,
    "",
    "export default function getContentSummary(",
    `  ${argName}: ${rootType}`,
    "): Record<string, string | number | boolean | null> {",
    "  return {};",
    "}",
  ].join("\n");
}

export const appSettingsStub = {
  type: "CollectionView",
  name: "My App",
  targetCollectionIds: ["ProtoCollection_0"],
};

// TODO_DEVENV: use DefaultApp from @superego/app-sandbox/components
export const appMainTsxStub = `import { Grid, Text, Tile } from "@superego/app-sandbox/components";
import React from "react";

export default function App(): React.ReactElement {
  return (
    <Grid>
      <Grid.Col span={{ sm: 12, md: 12, lg: 12 }}>
        <Tile>
          <Text element="h2" size="lg" weight="semibold">
            My App
          </Text>
        </Tile>
      </Grid.Col>
    </Grid>
  );
}
`;
