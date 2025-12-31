import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("DocumentTextSearchIndex", (deps) => {
  it("upserting and searching", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    const collectionId = Id.generate.collection();
    const documentId = Id.generate.document();
    const textChunks = {
      title: ["Hello World"],
      body: ["Test document", "With multiple chunks"],
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.documentTextSearchIndex.upsert(
          collectionId,
          documentId,
          textChunks,
        );
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const results = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.documentTextSearchIndex.search(
          collectionId,
          "Hello",
        ),
      }),
    );
    expect(results).toMatchObject([{ collectionId, documentId }]);
  });

  it("upserting replaces existing text chunks", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    const collectionId = Id.generate.collection();
    const documentId = Id.generate.document();
    const originalTextChunks = {
      title: ["Original title"],
      body: ["Original body"],
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.documentTextSearchIndex.upsert(
          collectionId,
          documentId,
          originalTextChunks,
        );
        return { action: "commit", returnValue: null };
      },
    );
    const updatedTextChunks = {
      title: ["Updated title"],
      body: ["Updated body"],
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.documentTextSearchIndex.upsert(
          collectionId,
          documentId,
          updatedTextChunks,
        );
        return { action: "commit", returnValue: null };
      },
    );

    // Verify: original content should not be found
    const originalResults =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.documentTextSearchIndex.search(
            collectionId,
            "Original",
          ),
        }),
      );
    expect(originalResults).toEqual([]);

    // Verify: updated content should be found
    const updatedResults =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.documentTextSearchIndex.search(
            collectionId,
            "Updated",
          ),
        }),
      );
    expect(updatedResults).toMatchObject([{ collectionId, documentId }]);
  });

  it("removing", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const collectionId = Id.generate.collection();
    const documentId = Id.generate.document();
    const textChunks = {
      title: ["Title"],
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.documentTextSearchIndex.upsert(
          collectionId,
          documentId,
          textChunks,
        );
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.documentTextSearchIndex.remove(collectionId, documentId);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const results = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.documentTextSearchIndex.search(
          collectionId,
          "Title",
        ),
      }),
    );
    expect(results).toEqual([]);
  });

  describe("searching", () => {
    it("case: no matching documents => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const results =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: await repos.documentTextSearchIndex.search(
              null,
              "nonexistent",
            ),
          }),
        );

      // Verify
      expect(results).toEqual([]);
    });

    it("case: multiple matching documents => returns all", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId = Id.generate.collection();
      const documentId1 = Id.generate.document();
      const documentId2 = Id.generate.document();
      const documentId3 = Id.generate.document();
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentTextSearchIndex.upsert(
            collectionId,
            documentId1,
            {
              title: ["Common keyword here"],
            },
          );
          await repos.documentTextSearchIndex.upsert(
            collectionId,
            documentId2,
            {
              body: ["Another common keyword"],
            },
          );
          await repos.documentTextSearchIndex.upsert(
            collectionId,
            documentId3,
            {
              title: ["Different content"],
            },
          );
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const results =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: await repos.documentTextSearchIndex.search(
              collectionId,
              "common",
            ),
          }),
        );

      // Verify
      expect(results).toHaveLength(2);
      expect(results).toContainEqual(
        expect.objectContaining({ collectionId, documentId: documentId1 }),
      );
      expect(results).toContainEqual(
        expect.objectContaining({ collectionId, documentId: documentId2 }),
      );
    });

    it("case: search with null collectionId => searches across all collections", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId1 = Id.generate.collection();
      const collectionId2 = Id.generate.collection();
      const documentId1 = Id.generate.document();
      const documentId2 = Id.generate.document();
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentTextSearchIndex.upsert(
            collectionId1,
            documentId1,
            {
              title: ["Shared term in collection one"],
            },
          );
          await repos.documentTextSearchIndex.upsert(
            collectionId2,
            documentId2,
            {
              title: ["Shared term in collection two"],
            },
          );
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const results =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: await repos.documentTextSearchIndex.search(
              null,
              "Shared",
            ),
          }),
        );

      // Verify
      expect(results).toHaveLength(2);
      expect(results).toContainEqual(
        expect.objectContaining({
          collectionId: collectionId1,
          documentId: documentId1,
        }),
      );
      expect(results).toContainEqual(
        expect.objectContaining({
          collectionId: collectionId2,
          documentId: documentId2,
        }),
      );
    });

    it("case: search with specific collectionId => only searches that collection", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId1 = Id.generate.collection();
      const collectionId2 = Id.generate.collection();
      const documentId1 = Id.generate.document();
      const documentId2 = Id.generate.document();
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentTextSearchIndex.upsert(
            collectionId1,
            documentId1,
            {
              title: ["Filtered content"],
            },
          );
          await repos.documentTextSearchIndex.upsert(
            collectionId2,
            documentId2,
            {
              title: ["Filtered content"],
            },
          );
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const results =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: await repos.documentTextSearchIndex.search(
              collectionId1,
              "Filtered",
            ),
          }),
        );

      // Verify
      expect(results).toEqual([
        expect.objectContaining({
          collectionId: collectionId1,
          documentId: documentId1,
        }),
      ]);
    });

    it("case: search finds content in different paths", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId = Id.generate.collection();
      const documentId = Id.generate.document();
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentTextSearchIndex.upsert(collectionId, documentId, {
            title: ["Title content"],
            body: ["Body content"],
            metadata: ["Metadata content"],
          });
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const { titleResults, bodyResults, metadataResults } =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: {
              titleResults: await repos.documentTextSearchIndex.search(
                collectionId,
                "Title",
              ),
              bodyResults: await repos.documentTextSearchIndex.search(
                collectionId,
                "Body",
              ),
              metadataResults: await repos.documentTextSearchIndex.search(
                collectionId,
                "Metadata",
              ),
            },
          }),
        );

      // Verify
      expect(titleResults).toEqual([
        expect.objectContaining({ collectionId, documentId }),
      ]);
      expect(bodyResults).toEqual([
        expect.objectContaining({ collectionId, documentId }),
      ]);
      expect(metadataResults).toEqual([
        expect.objectContaining({ collectionId, documentId }),
      ]);
    });

    it("case: search finds content across multiple chunks in same path", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId = Id.generate.collection();
      const documentId = Id.generate.document();
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentTextSearchIndex.upsert(collectionId, documentId, {
            paragraphs: [
              "First paragraph with unique1",
              "Second paragraph with unique2",
              "Third paragraph with unique3",
            ],
          });
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const { results1, results2, results3 } =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: {
              results1: await repos.documentTextSearchIndex.search(
                collectionId,
                "unique1",
              ),
              results2: await repos.documentTextSearchIndex.search(
                collectionId,
                "unique2",
              ),
              results3: await repos.documentTextSearchIndex.search(
                collectionId,
                "unique3",
              ),
            },
          }),
        );

      // Verify
      expect(results1).toEqual([
        expect.objectContaining({ collectionId, documentId }),
      ]);
      expect(results2).toEqual([
        expect.objectContaining({ collectionId, documentId }),
      ]);
      expect(results3).toEqual([
        expect.objectContaining({ collectionId, documentId }),
      ]);
    });

    it("case: search matches partial words", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const collectionId = Id.generate.collection();
      const documentId = Id.generate.document();
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.documentTextSearchIndex.upsert(collectionId, documentId, {
            title: ["Document about programming"],
          });
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise: search with typos (missing letter, swapped letters)
      const results =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: await repos.documentTextSearchIndex.search(
              collectionId,
              "program",
            ),
          }),
        );

      // Verify: typos should still find the document
      expect(results).toEqual([
        expect.objectContaining({ collectionId, documentId }),
      ]);
    });
  });
});
