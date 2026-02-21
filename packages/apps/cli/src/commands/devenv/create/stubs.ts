import { DataType, type Schema } from "@superego/schema";

export const packJsonStub = {
  id: "Pack_com.example.stub",
  name: "Stub Pack",
  shortDescription: "",
  longDescription: "",
  collectionCategories: [],
};

export const collectionSettingsStub = {
  name: "Stub Collection",
  icon: null,
  collectionCategoryId: null,
  description: null,
  assistantInstructions: null,
  defaultCollectionViewAppId: "ProtoApp_0",
};

export const collectionSchemaStub: Schema = {
  types: {
    StubItem: {
      dataType: DataType.Struct,
      properties: {},
    },
  },
  rootType: "StubItem",
};

export const contentSummaryGetterStub = `
import type { StubItem } from "../generated/ProtoCollection_0.js";

export default function getContentSummary(
  stubItem: StubItem
): Record<string, string | number | boolean | null> {
  return {};
}
`.trim();

export const appSettingsStub = {
  type: "CollectionView",
  name: "Stub App",
  targetCollectionIds: ["ProtoCollection_0"],
};

export const contentBlockingKeysGetterStub = `
import type { StubItem } from "../generated/ProtoCollection_0.js";

export default function getContentBlockingKeys(
  stubItem: StubItem
): string[] {
  return [];
}
`.trim();

export const demoDocumentStub = {
  collectionId: "ProtoCollection_0",
  content: {},
};

export const appMainTsxStub = `
import React from "react";
import { DefaultApp } from "@superego/app-sandbox/components";
import type * as ProtoCollection_0 from "../generated/ProtoCollection_0.js";

interface Props {
  collections: {
    ProtoCollection_0: {
      id: "ProtoCollection_0";
      versionId: string;
      displayName: string;
      documents: {
        id: string;
        versionId: string;
        /**
         * Href to the document details page. The anchor element setting this as
         * \`href\` must also set \`target=_top\`.
         */
        href: string;
        content: ProtoCollection_0.StubItem;
      }[];
    };
  };
}

export default function App(props: Props): React.ReactElement | null {
  // The DefaultApp component is only a placeholder. Don't include it in the
  // final version of the app.
  return <DefaultApp {...props} />;
}
`.trim();
