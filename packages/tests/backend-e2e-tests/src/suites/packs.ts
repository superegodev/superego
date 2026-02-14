import { AppType } from "@superego/backend";
import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Packs", (deps) => {
  describe("installPack", () => {
    it("error: PackNotValid when proto collection category parent references future index", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.test",
        info: {
          name: "Test Pack",
          shortDescription: "A test pack",
          longDescription: "A test pack for testing",
          screenshots: [],
        },
        collectionCategories: [
          {
            name: "Child",
            icon: null,
            // References index 1 which comes after index 0
            parentId: Id.generate.protoCollectionCategory(1),
          },
          {
            name: "Parent",
            icon: null,
            parentId: null,
          },
        ],
        collections: [],
        apps: [],
        documents: [],
      });

      // Verify
      expect(result.success).toBe(false);
      assert.isFalse(result.success);
      expect(result.error.name).toBe("PackNotValid");
    });

    it("error: PackNotValid when collection references unknown proto collection category", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.test",
        info: {
          name: "Test Pack",
          shortDescription: "A test pack",
          longDescription: "A test pack for testing",
          screenshots: [],
        },
        collectionCategories: [],
        collections: [
          {
            settings: {
              name: "Test Collection",
              icon: null,
              collectionCategoryId: Id.generate.protoCollectionCategory(99),
              defaultCollectionViewAppId: null,
              description: null,
              assistantInstructions: null,
            },
            schema: {
              types: { Root: { dataType: DataType.Struct, properties: {} } },
              rootType: "Root",
            },
            versionSettings: {
              defaultDocumentLayoutOptions: null,
              contentBlockingKeysGetter: null,
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
        ],
        apps: [],
        documents: [],
      });

      // Verify
      expect(result.success).toBe(false);
      assert.isFalse(result.success);
      expect(result.error.name).toBe("PackNotValid");
      expect(result.error).toEqual({
        name: "PackNotValid",
        details: {
          issues: [
            {
              message:
                "Collection at index 0 references unknown proto collection category: ProtoCollectionCategory_99",
              path: [
                { key: "collections" },
                { key: 0 },
                { key: "settings" },
                { key: "collectionCategoryId" },
              ],
            },
          ],
        },
      });
    });

    it("error: PackNotValid when collection references unknown proto app", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.test",
        info: {
          name: "Test Pack",
          shortDescription: "A test pack",
          longDescription: "A test pack for testing",
          screenshots: [],
        },
        collectionCategories: [],
        collections: [
          {
            settings: {
              name: "Test Collection",
              icon: null,
              collectionCategoryId: null,
              defaultCollectionViewAppId: Id.generate.protoApp(99),
              description: null,
              assistantInstructions: null,
            },
            schema: {
              types: { Root: { dataType: DataType.Struct, properties: {} } },
              rootType: "Root",
            },
            versionSettings: {
              defaultDocumentLayoutOptions: null,
              contentBlockingKeysGetter: null,
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
        ],
        apps: [],
        documents: [],
      });

      // Verify
      expect(result.success).toBe(false);
      assert.isFalse(result.success);
      expect(result.error).toEqual({
        name: "PackNotValid",
        details: {
          issues: [
            {
              message:
                "Collection at index 0 references unknown proto app: ProtoApp_99",
              path: [
                { key: "collections" },
                { key: 0 },
                { key: "settings" },
                { key: "defaultCollectionViewAppId" },
              ],
            },
          ],
        },
      });
    });

    it("error: PackNotValid when collection schema references unknown proto collection", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.test",
        info: {
          name: "Test Pack",
          shortDescription: "A test pack",
          longDescription: "A test pack for testing",
          screenshots: [],
        },
        collectionCategories: [],
        collections: [
          {
            settings: {
              name: "Test Collection",
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
                    linkedDoc: {
                      dataType: DataType.DocumentRef,
                      collectionId: Id.generate.protoCollection(99),
                    },
                  },
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              defaultDocumentLayoutOptions: null,
              contentBlockingKeysGetter: null,
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
        ],
        apps: [],
        documents: [],
      });

      // Verify
      expect(result.success).toBe(false);
      assert.isFalse(result.success);
      expect(result.error).toEqual({
        name: "PackNotValid",
        details: {
          issues: [
            {
              message:
                "Collection at index 0 schema references unknown proto collection: ProtoCollection_99",
              path: [{ key: "collections" }, { key: 0 }, { key: "schema" }],
            },
          ],
        },
      });
    });

    it("error: PackNotValid when app references unknown proto collection", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.test",
        info: {
          name: "Test Pack",
          shortDescription: "A test pack",
          longDescription: "A test pack for testing",
          screenshots: [],
        },
        collectionCategories: [],
        collections: [],
        apps: [
          {
            type: AppType.CollectionView,
            name: "Test App",
            targetCollectionIds: [Id.generate.protoCollection(99)],
            files: { "/main.tsx": { source: "", compiled: "" } },
          },
        ],
        documents: [],
      });

      // Verify
      expect(result.success).toBe(false);
      assert.isFalse(result.success);
      expect(result.error).toEqual({
        name: "PackNotValid",
        details: {
          issues: [
            {
              message:
                "App at index 0 references unknown proto collection: ProtoCollection_99",
              path: [
                { key: "apps" },
                { key: 0 },
                { key: "targetCollectionIds" },
                { key: 0 },
              ],
            },
          ],
        },
      });
    });

    it("error: PackNotValid when document references unknown proto collection", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.test",
        info: {
          name: "Test Pack",
          shortDescription: "A test pack",
          longDescription: "A test pack for testing",
          screenshots: [],
        },
        collectionCategories: [],
        collections: [],
        apps: [],
        documents: [
          {
            collectionId: Id.generate.protoCollection(99),
            content: {},
          },
        ],
      });

      // Verify
      expect(result.success).toBe(false);
      assert.isFalse(result.success);
      expect(result.error).toEqual({
        name: "PackNotValid",
        details: {
          issues: [
            {
              message:
                "Document at index 0 references unknown proto collection: ProtoCollection_99",
              path: [{ key: "documents" }, { key: 0 }, { key: "collectionId" }],
            },
          ],
        },
      });
    });

    it("error: PackNotValid when document content references unknown proto document", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.test",
        info: {
          name: "Test Pack",
          shortDescription: "A test pack",
          longDescription: "A test pack for testing",
          screenshots: [],
        },
        collectionCategories: [],
        collections: [
          {
            settings: {
              name: "Test Collection",
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
                    linkedDoc: {
                      dataType: DataType.DocumentRef,
                      collectionId: Id.generate.protoCollection(0),
                    },
                  },
                  nullableProperties: ["linkedDoc"],
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              defaultDocumentLayoutOptions: null,
              contentBlockingKeysGetter: null,
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
        ],
        apps: [],
        documents: [
          {
            collectionId: Id.generate.protoCollection(0),
            content: {
              linkedDoc: {
                collectionId: Id.generate.protoCollection(0),
                documentId: Id.generate.protoDocument(99),
              },
            },
          },
        ],
      });

      // Verify
      expect(result.success).toBe(false);
      assert.isFalse(result.success);
      expect(result.error).toEqual({
        name: "PackNotValid",
        details: {
          issues: [
            {
              message:
                "Document at index 0 content references unknown proto document: ProtoDocument_99",
              path: [{ key: "documents" }, { key: 0 }, { key: "content" }],
            },
          ],
        },
      });
    });

    it("success: installs pack with collection categories", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.test",
        info: {
          name: "Test Pack",
          shortDescription: "A test pack",
          longDescription: "A test pack for testing",
          screenshots: [],
        },
        collectionCategories: [
          {
            name: "Parent Category",
            icon: null,
            parentId: null,
          },
          {
            name: "Child Category",
            icon: null,
            parentId: Id.generate.protoCollectionCategory(0),
          },
        ],
        collections: [],
        apps: [],
        documents: [],
      });

      // Verify
      expect(result.success).toBe(true);
      assert.isTrue(result.success);
      expect(result.data.collectionCategories).toHaveLength(2);
      expect(result.data.collectionCategories[0]!.name).toBe("Parent Category");
      expect(result.data.collectionCategories[0]!.parentId).toBeNull();
      expect(result.data.collectionCategories[1]!.name).toBe("Child Category");
      expect(result.data.collectionCategories[1]!.parentId).toBe(
        result.data.collectionCategories[0]!.id,
      );
      const listResult = await backend.collectionCategories.list();
      assert.isTrue(listResult.success);
      expect(listResult.data).toHaveLength(2);
    });

    it("success: installs pack with collections referencing collection categories", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.test",
        info: {
          name: "Test Pack",
          shortDescription: "A test pack",
          longDescription: "A test pack for testing",
          screenshots: [],
        },
        collectionCategories: [
          {
            name: "My Category",
            icon: null,
            parentId: null,
          },
        ],
        collections: [
          {
            settings: {
              name: "My Collection",
              icon: null,
              collectionCategoryId: Id.generate.protoCollectionCategory(0),
              defaultCollectionViewAppId: null,
              description: null,
              assistantInstructions: null,
            },
            schema: {
              types: {
                Root: {
                  dataType: DataType.Struct,
                  properties: { title: { dataType: DataType.String } },
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              defaultDocumentLayoutOptions: null,
              contentBlockingKeysGetter: null,
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
        ],
        apps: [],
        documents: [],
      });

      // Verify
      expect(result.success).toBe(true);
      assert.isTrue(result.success);
      expect(result.data.collectionCategories).toHaveLength(1);
      expect(result.data.collections).toHaveLength(1);
      expect(result.data.collections[0]!.settings.collectionCategoryId).toBe(
        result.data.collectionCategories[0]!.id,
      );
      const listResult = await backend.collections.list();
      assert.isTrue(listResult.success);
      expect(listResult.data).toHaveLength(1);
    });

    it("success: installs pack with apps referencing collections", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.test",
        info: {
          name: "Test Pack",
          shortDescription: "A test pack",
          longDescription: "A test pack for testing",
          screenshots: [],
        },
        collectionCategories: [],
        collections: [
          {
            settings: {
              name: "My Collection",
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
                  properties: { title: { dataType: DataType.String } },
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              defaultDocumentLayoutOptions: null,
              contentBlockingKeysGetter: null,
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
        ],
        apps: [
          {
            type: AppType.CollectionView,
            name: "My App",
            targetCollectionIds: [Id.generate.protoCollection(0)],
            files: { "/main.tsx": { source: "", compiled: "" } },
          },
        ],
        documents: [],
      });

      // Verify
      expect(result.success).toBe(true);
      assert.isTrue(result.success);
      expect(result.data.collections).toHaveLength(1);
      expect(result.data.apps).toHaveLength(1);
      expect(result.data.apps[0]!.name).toBe("My App");
      expect(result.data.apps[0]!.latestVersion.targetCollections[0]!.id).toBe(
        result.data.collections[0]!.id,
      );
      const listResult = await backend.apps.list();
      assert.isTrue(listResult.success);
      expect(listResult.data).toHaveLength(1);
    });

    it("success: installs pack with documents", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.test",
        info: {
          name: "Test Pack",
          shortDescription: "A test pack",
          longDescription: "A test pack for testing",
          screenshots: [],
        },
        collectionCategories: [],
        collections: [
          {
            settings: {
              name: "My Collection",
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
                  properties: { title: { dataType: DataType.String } },
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              defaultDocumentLayoutOptions: null,
              contentBlockingKeysGetter: null,
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
        ],
        apps: [],
        documents: [
          {
            collectionId: Id.generate.protoCollection(0),
            content: { title: "My Document" },
          },
        ],
      });

      // Verify
      expect(result.success).toBe(true);
      assert.isTrue(result.success);
      expect(result.data.collections).toHaveLength(1);
      expect(result.data.documents).toHaveLength(1);
      expect(result.data.documents[0]!.latestVersion.content).toEqual({
        title: "My Document",
      });
      const listResult = await backend.documents.list(
        result.data.collections[0]!.id,
      );
      assert.isTrue(listResult.success);
      expect(listResult.data).toHaveLength(1);
    });

    it("success: installs complete pack with all object types", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.complete",
        info: {
          name: "Complete Test Pack",
          shortDescription: "A complete test pack",
          longDescription: "A complete test pack with all object types",
          screenshots: [],
        },
        collectionCategories: [
          {
            name: "Category",
            icon: null,
            parentId: null,
          },
        ],
        collections: [
          {
            settings: {
              name: "Collection",
              icon: null,
              collectionCategoryId: Id.generate.protoCollectionCategory(0),
              defaultCollectionViewAppId: Id.generate.protoApp(0),
              description: "A collection",
              assistantInstructions: null,
            },
            schema: {
              types: {
                Root: {
                  dataType: DataType.Struct,
                  properties: { title: { dataType: DataType.String } },
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              defaultDocumentLayoutOptions: null,
              contentBlockingKeysGetter: null,
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
        ],
        apps: [
          {
            type: AppType.CollectionView,
            name: "App",
            targetCollectionIds: [Id.generate.protoCollection(0)],
            files: { "/main.tsx": { source: "", compiled: "" } },
          },
        ],
        documents: [
          {
            collectionId: Id.generate.protoCollection(0),
            content: { title: "Document 1" },
          },
          {
            collectionId: Id.generate.protoCollection(0),
            content: { title: "Document 2" },
          },
        ],
      });

      // Verify
      expect(result.success).toBe(true);
      assert.isTrue(result.success);

      // All objects created.
      expect(result.data.collectionCategories).toHaveLength(1);
      expect(result.data.collections).toHaveLength(1);
      expect(result.data.apps).toHaveLength(1);
      expect(result.data.documents).toHaveLength(2);

      // References resolved correctly.
      expect(result.data.collections[0]!.settings.collectionCategoryId).toBe(
        result.data.collectionCategories[0]!.id,
      );
      expect(
        result.data.collections[0]!.settings.defaultCollectionViewAppId,
      ).toBe(result.data.apps[0]!.id);
      expect(result.data.apps[0]!.latestVersion.targetCollections[0]!.id).toBe(
        result.data.collections[0]!.id,
      );
      expect(result.data.documents[0]!.collectionId).toBe(
        result.data.collections[0]!.id,
      );
      expect(result.data.documents[1]!.collectionId).toBe(
        result.data.collections[0]!.id,
      );

      // All objects are persisted.
      const categoriesListResult = await backend.collectionCategories.list();
      assert.isTrue(categoriesListResult.success);
      expect(categoriesListResult.data).toHaveLength(1);

      const collectionsListResult = await backend.collections.list();
      assert.isTrue(collectionsListResult.success);
      expect(collectionsListResult.data).toHaveLength(1);

      const appsListResult = await backend.apps.list();
      assert.isTrue(appsListResult.success);
      expect(appsListResult.data).toHaveLength(1);

      const documentsListResult = await backend.documents.list(
        result.data.collections[0]!.id,
      );
      assert.isTrue(documentsListResult.success);
      expect(documentsListResult.data).toHaveLength(2);
    });

    it("success: installs pack with cross-collection document references", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.crossref",
        info: {
          name: "Cross-Reference Test Pack",
          shortDescription: "A pack with cross-collection references",
          longDescription:
            "A test pack with documents referencing documents in other collections",
          screenshots: [],
        },
        collectionCategories: [
          {
            name: "People",
            icon: null,
            parentId: null,
          },
          {
            name: "Content",
            icon: null,
            parentId: null,
          },
        ],
        collections: [
          // Collection 0: Authors
          {
            settings: {
              name: "Authors",
              icon: null,
              collectionCategoryId: Id.generate.protoCollectionCategory(0),
              defaultCollectionViewAppId: null,
              description: "Collection of authors",
              assistantInstructions: null,
            },
            schema: {
              types: {
                Root: {
                  dataType: DataType.Struct,
                  properties: {
                    name: { dataType: DataType.String },
                    bio: { dataType: DataType.String },
                  },
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              defaultDocumentLayoutOptions: null,
              contentBlockingKeysGetter: null,
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
          // Collection 1: Articles (references Authors)
          {
            settings: {
              name: "Articles",
              icon: null,
              collectionCategoryId: Id.generate.protoCollectionCategory(1),
              defaultCollectionViewAppId: null,
              description: "Collection of articles",
              assistantInstructions: null,
            },
            schema: {
              types: {
                Root: {
                  dataType: DataType.Struct,
                  properties: {
                    title: { dataType: DataType.String },
                    author: {
                      dataType: DataType.DocumentRef,
                      collectionId: Id.generate.protoCollection(0),
                    },
                    relatedArticles: {
                      dataType: DataType.List,
                      items: {
                        dataType: DataType.DocumentRef,
                        collectionId: Id.generate.protoCollection(1),
                      },
                    },
                  },
                  nullableProperties: ["author"],
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              defaultDocumentLayoutOptions: null,
              contentBlockingKeysGetter: null,
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
          // Collection 2: Comments (references both Authors and Articles)
          {
            settings: {
              name: "Comments",
              icon: null,
              collectionCategoryId: Id.generate.protoCollectionCategory(1),
              defaultCollectionViewAppId: null,
              description: "Collection of comments",
              assistantInstructions: null,
            },
            schema: {
              types: {
                Root: {
                  dataType: DataType.Struct,
                  properties: {
                    text: { dataType: DataType.String },
                    author: {
                      dataType: DataType.DocumentRef,
                      collectionId: Id.generate.protoCollection(0),
                    },
                    article: {
                      dataType: DataType.DocumentRef,
                      collectionId: Id.generate.protoCollection(1),
                    },
                  },
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              defaultDocumentLayoutOptions: null,
              contentBlockingKeysGetter: null,
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
        ],
        apps: [],
        documents: [
          // Document 0: Author "Alice" in Authors collection
          {
            collectionId: Id.generate.protoCollection(0),
            content: { name: "Alice", bio: "Tech writer" },
          },
          // Document 1: Author "Bob" in Authors collection
          {
            collectionId: Id.generate.protoCollection(0),
            content: { name: "Bob", bio: "Science journalist" },
          },
          // Document 2: Article by Alice, referencing nothing yet
          {
            collectionId: Id.generate.protoCollection(1),
            content: {
              title: "Introduction to Testing",
              author: {
                collectionId: Id.generate.protoCollection(0),
                documentId: Id.generate.protoDocument(0),
              },
              relatedArticles: [],
            },
          },
          // Document 3: Article by Bob, referencing the first article
          {
            collectionId: Id.generate.protoCollection(1),
            content: {
              title: "Advanced Testing Patterns",
              author: {
                collectionId: Id.generate.protoCollection(0),
                documentId: Id.generate.protoDocument(1),
              },
              relatedArticles: [
                {
                  collectionId: Id.generate.protoCollection(1),
                  documentId: Id.generate.protoDocument(2),
                },
              ],
            },
          },
          // Document 4: Comment by Alice on Bob's article
          {
            collectionId: Id.generate.protoCollection(2),
            content: {
              text: "Great article!",
              author: {
                collectionId: Id.generate.protoCollection(0),
                documentId: Id.generate.protoDocument(0),
              },
              article: {
                collectionId: Id.generate.protoCollection(1),
                documentId: Id.generate.protoDocument(3),
              },
            },
          },
          // Document 5: Comment by Bob on Alice's article
          {
            collectionId: Id.generate.protoCollection(2),
            content: {
              text: "Thanks for the introduction!",
              author: {
                collectionId: Id.generate.protoCollection(0),
                documentId: Id.generate.protoDocument(1),
              },
              article: {
                collectionId: Id.generate.protoCollection(1),
                documentId: Id.generate.protoDocument(2),
              },
            },
          },
        ],
      });

      // Verify
      expect(result.success).toBe(true);
      assert.isTrue(result.success);

      // All objects created.
      expect(result.data.collectionCategories).toHaveLength(2);
      expect(result.data.collections).toHaveLength(3);
      expect(result.data.documents).toHaveLength(6);

      const [authorsCollection, articlesCollection, commentsCollection] =
        result.data.collections;
      const [alice, bob, article1, article2, comment1, comment2] =
        result.data.documents;

      // Collection category references resolved.
      expect(authorsCollection!.settings.collectionCategoryId).toBe(
        result.data.collectionCategories[0]!.id,
      );
      expect(articlesCollection!.settings.collectionCategoryId).toBe(
        result.data.collectionCategories[1]!.id,
      );
      expect(commentsCollection!.settings.collectionCategoryId).toBe(
        result.data.collectionCategories[1]!.id,
      );

      // Schema DocumentRef collectionIds resolved.
      const articlesRootType = articlesCollection!.latestVersion.schema.types[
        "Root"
      ] as any;
      const commentsRootType = commentsCollection!.latestVersion.schema.types[
        "Root"
      ] as any;
      expect(articlesRootType.properties.author.collectionId).toBe(
        authorsCollection!.id,
      );
      expect(commentsRootType.properties.author.collectionId).toBe(
        authorsCollection!.id,
      );
      expect(commentsRootType.properties.article.collectionId).toBe(
        articlesCollection!.id,
      );

      // Authors are in the Authors collection.
      expect(alice!.collectionId).toBe(authorsCollection!.id);
      expect(bob!.collectionId).toBe(authorsCollection!.id);

      // Articles are in the Articles collection.
      expect(article1!.collectionId).toBe(articlesCollection!.id);
      expect(article2!.collectionId).toBe(articlesCollection!.id);

      // Comments are in the Comments collection.
      expect(comment1!.collectionId).toBe(commentsCollection!.id);
      expect(comment2!.collectionId).toBe(commentsCollection!.id);

      // Article author references resolved.
      expect(article1!.latestVersion.content.author).toEqual({
        collectionId: authorsCollection!.id,
        documentId: alice!.id,
      });
      expect(article2!.latestVersion.content.author).toEqual({
        collectionId: authorsCollection!.id,
        documentId: bob!.id,
      });

      // Article relatedArticles references resolved.
      expect(article2!.latestVersion.content.relatedArticles).toEqual([
        { collectionId: articlesCollection!.id, documentId: article1!.id },
      ]);

      // Comment references resolved.
      expect(comment1!.latestVersion.content.author).toEqual({
        collectionId: authorsCollection!.id,
        documentId: alice!.id,
      });
      expect(comment1!.latestVersion.content.article).toEqual({
        collectionId: articlesCollection!.id,
        documentId: article2!.id,
      });
      expect(comment2!.latestVersion.content.author).toEqual({
        collectionId: authorsCollection!.id,
        documentId: bob!.id,
      });
      expect(comment2!.latestVersion.content.article).toEqual({
        collectionId: articlesCollection!.id,
        documentId: article1!.id,
      });

      // All objects are persisted.
      const categoriesListResult = await backend.collectionCategories.list();
      assert.isTrue(categoriesListResult.success);
      expect(categoriesListResult.data).toHaveLength(2);

      const collectionsListResult = await backend.collections.list();
      assert.isTrue(collectionsListResult.success);
      expect(collectionsListResult.data).toHaveLength(3);

      const authorsListResult = await backend.documents.list(
        authorsCollection!.id,
      );
      assert.isTrue(authorsListResult.success);
      expect(authorsListResult.data).toHaveLength(2);

      const articlesListResult = await backend.documents.list(
        articlesCollection!.id,
      );
      assert.isTrue(articlesListResult.success);
      expect(articlesListResult.data).toHaveLength(2);

      const commentsListResult = await backend.documents.list(
        commentsCollection!.id,
      );
      assert.isTrue(commentsListResult.success);
      expect(commentsListResult.data).toHaveLength(2);
    });

    it("success: installs pack with self-referencing DocumentRef in schema", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.packs.installPack({
        id: "Pack_com.example.selfreference",
        info: {
          name: "Self-Reference Test Pack",
          shortDescription: "A pack with self-referencing documents",
          longDescription:
            "A test pack with a collection where documents can reference other documents in the same collection",
          screenshots: [],
        },
        collectionCategories: [],
        collections: [
          {
            settings: {
              name: "Tasks",
              icon: null,
              collectionCategoryId: null,
              defaultCollectionViewAppId: null,
              description: "Hierarchical tasks collection",
              assistantInstructions: null,
            },
            schema: {
              types: {
                Root: {
                  dataType: DataType.Struct,
                  properties: {
                    title: { dataType: DataType.String },
                    parent: {
                      dataType: DataType.DocumentRef,
                      collectionId: "self",
                    },
                    subtasks: {
                      dataType: DataType.List,
                      items: {
                        dataType: DataType.DocumentRef,
                        collectionId: "self",
                      },
                    },
                  },
                  nullableProperties: ["parent"],
                },
              },
              rootType: "Root",
            },
            versionSettings: {
              defaultDocumentLayoutOptions: null,
              contentBlockingKeysGetter: null,
              contentSummaryGetter: {
                source: "",
                compiled:
                  "export default function getContentSummary() { return {}; }",
              },
            },
          },
        ],
        apps: [],
        documents: [
          // Document 0: Root task with no parent
          {
            collectionId: Id.generate.protoCollection(0),
            content: {
              title: "Project Alpha",
              parent: null,
              subtasks: [],
            },
          },
          // Document 1: Subtask of Project Alpha
          {
            collectionId: Id.generate.protoCollection(0),
            content: {
              title: "Design Phase",
              parent: {
                collectionId: Id.generate.protoCollection(0),
                documentId: Id.generate.protoDocument(0),
              },
              subtasks: [],
            },
          },
          // Document 2: Another subtask of Project Alpha, with its own subtask
          {
            collectionId: Id.generate.protoCollection(0),
            content: {
              title: "Development Phase",
              parent: {
                collectionId: Id.generate.protoCollection(0),
                documentId: Id.generate.protoDocument(0),
              },
              subtasks: [
                {
                  collectionId: Id.generate.protoCollection(0),
                  documentId: Id.generate.protoDocument(3),
                },
              ],
            },
          },
          // Document 3: Nested subtask
          {
            collectionId: Id.generate.protoCollection(0),
            content: {
              title: "Implement Feature X",
              parent: {
                collectionId: Id.generate.protoCollection(0),
                documentId: Id.generate.protoDocument(2),
              },
              subtasks: [],
            },
          },
        ],
      });

      // Verify
      expect(result.success).toBe(true);
      assert.isTrue(result.success);

      expect(result.data.collections).toHaveLength(1);
      expect(result.data.documents).toHaveLength(4);

      const tasksCollection = result.data.collections[0]!;
      const [projectAlpha, designPhase, devPhase, implementFeatureX] =
        result.data.documents;

      // Schema "self" collectionId resolved to actual collection ID.
      const tasksRootType = tasksCollection.latestVersion.schema.types[
        "Root"
      ] as any;
      expect(tasksRootType.properties.parent.collectionId).toBe(
        tasksCollection.id,
      );
      expect(tasksRootType.properties.subtasks.items.collectionId).toBe(
        tasksCollection.id,
      );

      // All documents are in the Tasks collection.
      expect(projectAlpha!.collectionId).toBe(tasksCollection.id);
      expect(designPhase!.collectionId).toBe(tasksCollection.id);
      expect(devPhase!.collectionId).toBe(tasksCollection.id);
      expect(implementFeatureX!.collectionId).toBe(tasksCollection.id);

      // Parent references resolved correctly.
      expect(projectAlpha!.latestVersion.content.parent).toBeNull();
      expect(designPhase!.latestVersion.content.parent).toEqual({
        collectionId: tasksCollection.id,
        documentId: projectAlpha!.id,
      });
      expect(devPhase!.latestVersion.content.parent).toEqual({
        collectionId: tasksCollection.id,
        documentId: projectAlpha!.id,
      });
      expect(implementFeatureX!.latestVersion.content.parent).toEqual({
        collectionId: tasksCollection.id,
        documentId: devPhase!.id,
      });

      // Subtasks references resolved correctly.
      expect(projectAlpha!.latestVersion.content.subtasks).toEqual([]);
      expect(designPhase!.latestVersion.content.subtasks).toEqual([]);
      expect(devPhase!.latestVersion.content.subtasks).toEqual([
        { collectionId: tasksCollection.id, documentId: implementFeatureX!.id },
      ]);
      expect(implementFeatureX!.latestVersion.content.subtasks).toEqual([]);

      // All objects are persisted.
      const tasksListResult = await backend.documents.list(tasksCollection.id);
      assert.isTrue(tasksListResult.success);
      expect(tasksListResult.data).toHaveLength(4);
    });
  });
});
