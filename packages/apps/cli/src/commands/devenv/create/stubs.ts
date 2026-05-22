import { DataType, type Schema } from "@superego/schema";
import contentBlockingKeysGetterStubSource from "./stub-files/contentBlockingKeysGetter.ts.template?raw";
import contentSummaryGetterStubSource from "./stub-files/contentSummaryGetter.ts.template?raw";
import appMainTsxStubSource from "./stub-files/main.tsx.template?raw";

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
  redirectToCollectionAfterDocumentCreation: false,
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

export const contentSummaryGetterStub =
  contentSummaryGetterStubSource.trimEnd();

export const appSettingsStub = {
  type: "CollectionView",
  name: "Stub App",
  targetCollectionIds: ["ProtoCollection_0"],
};

export const contentBlockingKeysGetterStub =
  contentBlockingKeysGetterStubSource.trimEnd();

export const demoDocumentStub = {
  collectionId: "ProtoCollection_0",
  content: {},
};

export const appMainTsxStub = appMainTsxStubSource.trimEnd();
