import type { Pack, PackId } from "@superego/backend";
import { AppType } from "@superego/backend";
import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Bazaar", (deps) => {
  const makeContentSummaryGetter = () => ({
    source: "",
    compiled: "export default function getContentSummary() { return {}; }",
  });

  const makeSimpleSchema = () => ({
    types: {
      Root: {
        dataType: DataType.Struct as const,
        properties: { title: { dataType: DataType.String as const } },
      },
    },
    rootType: "Root" as const,
  });

  const makeAppFiles = () => ({
    "/main.tsx": { source: "", compiled: "" },
  });

  const makePackInfo = (name: string) => ({
    name,
    coverImage: "/images/cover.png",
    shortDescription: "A short description",
    longDescription: "A long description in **markdown**",
    images: [],
  });

  const makeEmptyPack = (
    id: PackId,
    name: string,
  ): Pack => ({
    id,
    info: makePackInfo(name),
    collections: [],
    apps: [],
    documents: [],
  });

  describe("installPack", () => {
    it("error: PackNotValid - invalid pack id", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "invalid_id" as PackId,
        info: makePackInfo("Test Pack"),
        collections: [],
        apps: [],
        documents: [],
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "PackNotValid",
          details: {
            issues: [
              {
                message:
                  "Pack ID must be in reverse domain name format (e.g., Pack_com.example.mypack)",
              },
            ],
          },
        },
      });
    });

    it("error: PackNotValid - empty pack name", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "Pack_com.example.test" as PackId,
        info: {
          name: "",
          coverImage: "/images/cover.png",
          shortDescription: "",
          longDescription: "",
          images: [],
        },
        collections: [],
        apps: [],
        documents: [],
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "PackNotValid",
          details: {
            issues: [{ message: "Pack name is required" }],
          },
        },
      });
    });

    it("error: PackNotValid - duplicate collection proto IDs", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "Pack_com.example.test" as PackId,
        info: makePackInfo("Test Pack"),
        collections: [
          {
            protoId: Id.generate.protoCollection(0),
            settings: {
              name: "Collection 1",
              icon: null,
              defaultCollectionViewAppProtoId: null,
              description: null,
              assistantInstructions: null,
            },
            schema: makeSimpleSchema(),
            versionSettings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter: makeContentSummaryGetter(),
            },
          },
          {
            protoId: Id.generate.protoCollection(0),
            settings: {
              name: "Collection 2",
              icon: null,
              defaultCollectionViewAppProtoId: null,
              description: null,
              assistantInstructions: null,
            },
            schema: makeSimpleSchema(),
            versionSettings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter: makeContentSummaryGetter(),
            },
          },
        ],
        apps: [],
        documents: [],
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "PackNotValid",
          details: {
            issues: [
              { message: "Duplicate collection proto ID: ProtoCollection_0" },
            ],
          },
        },
      });
    });

    it("error: PackNotValid - app references non-existent collection", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "Pack_com.example.test" as PackId,
        info: makePackInfo("Test Pack"),
        collections: [],
        apps: [
          {
            protoId: Id.generate.protoApp(0),
            type: AppType.CollectionView,
            name: "Test App",
            targetCollectionProtoIds: [Id.generate.protoCollection(999)],
            files: makeAppFiles(),
          },
        ],
        documents: [],
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "PackNotValid",
          details: {
            issues: [
              {
                message:
                  'App "Test App" references non-existent collection proto ID: ProtoCollection_999',
              },
            ],
          },
        },
      });
    });

    it("error: PackNotValid - collection references non-existent app", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "Pack_com.example.test" as PackId,
        info: makePackInfo("Test Pack"),
        collections: [
          {
            protoId: Id.generate.protoCollection(0),
            settings: {
              name: "Collection 1",
              icon: null,
              defaultCollectionViewAppProtoId: Id.generate.protoApp(999),
              description: null,
              assistantInstructions: null,
            },
            schema: makeSimpleSchema(),
            versionSettings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter: makeContentSummaryGetter(),
            },
          },
        ],
        apps: [],
        documents: [],
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "PackNotValid",
          details: {
            issues: [
              {
                message:
                  'Collection "Collection 1" references non-existent app proto ID: ProtoApp_999',
              },
            ],
          },
        },
      });
    });

    it("error: PackNotValid - document references non-existent collection", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "Pack_com.example.test" as PackId,
        info: makePackInfo("Test Pack"),
        collections: [],
        apps: [],
        documents: [
          {
            protoId: Id.generate.protoDocument(0),
            collectionProtoId: Id.generate.protoCollection(999),
            content: { title: "Test Document" },
          },
        ],
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "PackNotValid",
          details: {
            issues: [
              {
                message:
                  'Document with proto ID "ProtoDocument_0" references non-existent collection proto ID: ProtoCollection_999',
              },
            ],
          },
        },
      });
    });

    it("success: installs empty pack", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack(
        makeEmptyPack("Pack_com.example.empty" as PackId, "Empty Pack"),
      );

      // Verify
      expect(result).toEqual({
        success: true,
        data: {
          collections: [],
          apps: [],
          documents: [],
        },
        error: null,
      });
    });

    it("success: installs pack with collections only", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "Pack_com.example.collections" as PackId,
        info: makePackInfo("Collections Pack"),
        collections: [
          {
            protoId: Id.generate.protoCollection(0),
            settings: {
              name: "Collection 1",
              icon: null,
              defaultCollectionViewAppProtoId: null,
              description: "First collection",
              assistantInstructions: null,
            },
            schema: makeSimpleSchema(),
            versionSettings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter: makeContentSummaryGetter(),
            },
          },
          {
            protoId: Id.generate.protoCollection(1),
            settings: {
              name: "Collection 2",
              icon: null,
              defaultCollectionViewAppProtoId: null,
              description: "Second collection",
              assistantInstructions: null,
            },
            schema: makeSimpleSchema(),
            versionSettings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter: makeContentSummaryGetter(),
            },
          },
        ],
        apps: [],
        documents: [],
      });

      // Verify
      assert.isTrue(result.success);
      expect(result.data?.collections).toHaveLength(2);
      expect(result.data?.collections[0]?.settings.name).toBe("Collection 1");
      expect(result.data?.collections[1]?.settings.name).toBe("Collection 2");
      expect(result.data?.apps).toHaveLength(0);
      expect(result.data?.documents).toHaveLength(0);

      // Verify collections are persisted
      const listResult = await backend.collections.list();
      assert.isTrue(listResult.success);
      expect(listResult.data).toHaveLength(2);
    });

    it("success: installs pack with apps only", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "Pack_com.example.apps" as PackId,
        info: makePackInfo("Apps Pack"),
        collections: [],
        apps: [
          {
            protoId: Id.generate.protoApp(0),
            type: AppType.CollectionView,
            name: "App 1",
            targetCollectionProtoIds: [],
            files: makeAppFiles(),
          },
          {
            protoId: Id.generate.protoApp(1),
            type: AppType.CollectionView,
            name: "App 2",
            targetCollectionProtoIds: [],
            files: makeAppFiles(),
          },
        ],
        documents: [],
      });

      // Verify
      assert.isTrue(result.success);
      expect(result.data?.collections).toHaveLength(0);
      expect(result.data?.apps).toHaveLength(2);
      expect(result.data?.apps[0]?.name).toBe("App 1");
      expect(result.data?.apps[1]?.name).toBe("App 2");
      expect(result.data?.documents).toHaveLength(0);

      // Verify apps are persisted
      const listResult = await backend.apps.list();
      assert.isTrue(listResult.success);
      expect(listResult.data).toHaveLength(2);
    });

    it("success: installs pack with collections and apps (no cross-references)", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "Pack_com.example.mixed" as PackId,
        info: makePackInfo("Mixed Pack"),
        collections: [
          {
            protoId: Id.generate.protoCollection(0),
            settings: {
              name: "Collection 1",
              icon: null,
              defaultCollectionViewAppProtoId: null,
              description: null,
              assistantInstructions: null,
            },
            schema: makeSimpleSchema(),
            versionSettings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter: makeContentSummaryGetter(),
            },
          },
        ],
        apps: [
          {
            protoId: Id.generate.protoApp(0),
            type: AppType.CollectionView,
            name: "App 1",
            targetCollectionProtoIds: [],
            files: makeAppFiles(),
          },
        ],
        documents: [],
      });

      // Verify
      assert.isTrue(result.success);
      expect(result.data?.collections).toHaveLength(1);
      expect(result.data?.apps).toHaveLength(1);
      expect(result.data?.documents).toHaveLength(0);
    });

    it("success: installs pack with bidirectional references", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "Pack_com.example.bidirectional" as PackId,
        info: makePackInfo("Bidirectional Pack"),
        collections: [
          {
            protoId: Id.generate.protoCollection(0),
            settings: {
              name: "Collection with default app",
              icon: null,
              defaultCollectionViewAppProtoId: Id.generate.protoApp(0),
              description: null,
              assistantInstructions: null,
            },
            schema: makeSimpleSchema(),
            versionSettings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter: makeContentSummaryGetter(),
            },
          },
        ],
        apps: [
          {
            protoId: Id.generate.protoApp(0),
            type: AppType.CollectionView,
            name: "App targeting collection",
            targetCollectionProtoIds: [Id.generate.protoCollection(0)],
            files: makeAppFiles(),
          },
        ],
        documents: [],
      });

      // Verify
      assert.isTrue(result.success);
      expect(result.data?.collections).toHaveLength(1);
      expect(result.data?.apps).toHaveLength(1);

      const collection = result.data?.collections[0];
      const app = result.data?.apps[0];

      // Collection should have the app as default view
      expect(collection?.settings.defaultCollectionViewAppId).toBe(app?.id);

      // App should target the collection
      expect(app?.latestVersion.targetCollections).toHaveLength(1);
      expect(app?.latestVersion.targetCollections[0]?.id).toBe(collection?.id);
    });

    it("success: installs pack with inter-collection document references in schemas", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "Pack_com.example.crossref" as PackId,
        info: makePackInfo("Cross-Reference Pack"),
        collections: [
          {
            protoId: Id.generate.protoCollection(0),
            settings: {
              name: "People",
              icon: null,
              defaultCollectionViewAppProtoId: null,
              description: null,
              assistantInstructions: null,
            },
            schema: {
              types: {
                Root: {
                  dataType: DataType.Struct,
                  properties: {
                    name: { dataType: DataType.String },
                  },
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter: makeContentSummaryGetter(),
            },
          },
          {
            protoId: Id.generate.protoCollection(1),
            settings: {
              name: "Tasks",
              icon: null,
              defaultCollectionViewAppProtoId: null,
              description: null,
              assistantInstructions: null,
            },
            schema: {
              types: {
                Root: {
                  dataType: DataType.Struct,
                  properties: {
                    title: { dataType: DataType.String },
                    assignee: {
                      dataType: DataType.DocumentRef,
                      collectionId: "ProtoCollection_0",
                    },
                  },
                  nullableProperties: ["assignee"],
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter: makeContentSummaryGetter(),
            },
          },
        ],
        apps: [],
        documents: [],
      });

      // Verify
      assert.isTrue(result.success);
      expect(result.data?.collections).toHaveLength(2);

      const peopleCollection = result.data?.collections[0];
      const tasksCollection = result.data?.collections[1];

      // Verify the schema reference was resolved
      const tasksSchema = tasksCollection?.latestVersion.schema;
      const assigneeType = (tasksSchema?.types["Root"] as any).properties
        .assignee;
      expect(assigneeType.collectionId).toBe(peopleCollection?.id);
    });

    it("success: installs pack with documents", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "Pack_com.example.withdocs" as PackId,
        info: makePackInfo("Pack with Documents"),
        collections: [
          {
            protoId: Id.generate.protoCollection(0),
            settings: {
              name: "Notes",
              icon: null,
              defaultCollectionViewAppProtoId: null,
              description: null,
              assistantInstructions: null,
            },
            schema: makeSimpleSchema(),
            versionSettings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter: makeContentSummaryGetter(),
            },
          },
        ],
        apps: [],
        documents: [
          {
            protoId: Id.generate.protoDocument(0),
            collectionProtoId: Id.generate.protoCollection(0),
            content: { title: "First Note" },
          },
          {
            protoId: Id.generate.protoDocument(1),
            collectionProtoId: Id.generate.protoCollection(0),
            content: { title: "Second Note" },
          },
        ],
      });

      // Verify
      assert.isTrue(result.success);
      expect(result.data?.collections).toHaveLength(1);
      expect(result.data?.apps).toHaveLength(0);
      expect(result.data?.documents).toHaveLength(2);
      expect(result.data?.documents[0]?.latestVersion.content.title).toBe(
        "First Note",
      );
      expect(result.data?.documents[1]?.latestVersion.content.title).toBe(
        "Second Note",
      );

      // Verify documents are persisted
      const collectionId = result.data?.collections[0]?.id;
      const listResult = await backend.documents.list(collectionId!);
      assert.isTrue(listResult.success);
      expect(listResult.data).toHaveLength(2);
    });

    it("success: installs pack with inter-document references", async () => {
      // Setup SUT
      const { backend } = deps();
      const peopleProtoCollectionId = Id.generate.protoCollection(0);
      const tasksProtoCollectionId = Id.generate.protoCollection(1);
      const personProtoDocId = Id.generate.protoDocument(0);
      const taskProtoDocId = Id.generate.protoDocument(1);

      // Exercise
      const result = await backend.bazaar.installPack({
        id: "Pack_com.example.docrefs" as PackId,
        info: makePackInfo("Pack with Document References"),
        collections: [
          {
            protoId: peopleProtoCollectionId,
            settings: {
              name: "People",
              icon: null,
              defaultCollectionViewAppProtoId: null,
              description: null,
              assistantInstructions: null,
            },
            schema: {
              types: {
                Root: {
                  dataType: DataType.Struct,
                  properties: {
                    name: { dataType: DataType.String },
                  },
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter: makeContentSummaryGetter(),
            },
          },
          {
            protoId: tasksProtoCollectionId,
            settings: {
              name: "Tasks",
              icon: null,
              defaultCollectionViewAppProtoId: null,
              description: null,
              assistantInstructions: null,
            },
            schema: {
              types: {
                Root: {
                  dataType: DataType.Struct,
                  properties: {
                    title: { dataType: DataType.String },
                    assignee: {
                      dataType: DataType.DocumentRef,
                      collectionId: peopleProtoCollectionId,
                    },
                  },
                  nullableProperties: ["assignee"],
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              contentBlockingKeysGetter: null,
              contentSummaryGetter: makeContentSummaryGetter(),
            },
          },
        ],
        apps: [],
        documents: [
          {
            protoId: personProtoDocId,
            collectionProtoId: peopleProtoCollectionId,
            content: { name: "John Doe" },
          },
          {
            protoId: taskProtoDocId,
            collectionProtoId: tasksProtoCollectionId,
            content: {
              title: "Review PR",
              assignee: {
                collectionId: peopleProtoCollectionId,
                documentId: personProtoDocId,
              },
            },
          },
        ],
      });

      // Verify
      assert.isTrue(result.success);
      expect(result.data?.collections).toHaveLength(2);
      expect(result.data?.documents).toHaveLength(2);

      const personDoc = result.data?.documents[0];
      const taskDoc = result.data?.documents[1];

      // Verify the document reference was resolved
      expect(taskDoc?.latestVersion.content.assignee).toEqual({
        collectionId: personDoc?.collectionId,
        documentId: personDoc?.id,
      });
    });
  });
});
