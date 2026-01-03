import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("ConversationTextSearchIndex", (deps) => {
  it("upserting and searching", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    const conversationId = Id.generate.conversation();
    const textChunks = {
      title: ["My Conversation"],
      messages: ["Hello world", "How are you?"],
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversationTextSearchIndex.upsert(
          conversationId,
          textChunks,
        );
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const results = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.conversationTextSearchIndex.search("Hello", {
          limit: 20,
        }),
      }),
    );
    expect(results).toMatchObject([{ conversationId }]);
  });

  it("upserting replaces existing text chunks", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    const conversationId = Id.generate.conversation();
    const originalTextChunks = {
      title: ["Original title"],
      messages: ["Original message"],
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversationTextSearchIndex.upsert(
          conversationId,
          originalTextChunks,
        );
        return { action: "commit", returnValue: null };
      },
    );
    const updatedTextChunks = {
      title: ["Updated title"],
      messages: ["Updated message"],
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversationTextSearchIndex.upsert(
          conversationId,
          updatedTextChunks,
        );
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const originalResults =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.conversationTextSearchIndex.search(
            "Original",
            { limit: 20 },
          ),
        }),
      );
    expect(originalResults).toEqual([]);

    // Verify
    const updatedResults =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.conversationTextSearchIndex.search(
            "Updated",
            { limit: 20 },
          ),
        }),
      );
    expect(updatedResults).toMatchObject([{ conversationId }]);
  });

  it("removing", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const conversationId = Id.generate.conversation();
    const textChunks = {
      title: ["Conversation Title"],
      messages: [],
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversationTextSearchIndex.upsert(
          conversationId,
          textChunks,
        );
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.conversationTextSearchIndex.remove(conversationId);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const results = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.conversationTextSearchIndex.search(
          "Conversation",
          { limit: 20 },
        ),
      }),
    );
    expect(results).toEqual([]);
  });

  describe("searching", () => {
    it("case: no matching conversations => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const results =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: await repos.conversationTextSearchIndex.search(
              "nonexistent",
              { limit: 20 },
            ),
          }),
        );

      // Verify
      expect(results).toEqual([]);
    });

    it("case: multiple matching conversations => returns all", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const conversationId1 = Id.generate.conversation();
      const conversationId2 = Id.generate.conversation();
      const conversationId3 = Id.generate.conversation();
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.conversationTextSearchIndex.upsert(conversationId1, {
            title: ["Common keyword here"],
            messages: [],
          });
          await repos.conversationTextSearchIndex.upsert(conversationId2, {
            title: [],
            messages: ["Another common keyword"],
          });
          await repos.conversationTextSearchIndex.upsert(conversationId3, {
            title: ["Different content"],
            messages: [],
          });
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const results =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: await repos.conversationTextSearchIndex.search(
              "common",
              { limit: 20 },
            ),
          }),
        );

      // Verify
      expect(results).toHaveLength(2);
      expect(results).toContainEqual(
        expect.objectContaining({ conversationId: conversationId1 }),
      );
      expect(results).toContainEqual(
        expect.objectContaining({ conversationId: conversationId2 }),
      );
    });

    it("case: search finds content in title and messages", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const conversationId = Id.generate.conversation();
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.conversationTextSearchIndex.upsert(conversationId, {
            title: ["Title content"],
            messages: ["Message content"],
          });
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const { titleResults, messageResults } =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: {
              titleResults: await repos.conversationTextSearchIndex.search(
                "Title",
                { limit: 20 },
              ),
              messageResults: await repos.conversationTextSearchIndex.search(
                "Message",
                { limit: 20 },
              ),
            },
          }),
        );

      // Verify
      expect(titleResults).toEqual([
        expect.objectContaining({ conversationId }),
      ]);
      expect(messageResults).toEqual([
        expect.objectContaining({ conversationId }),
      ]);
    });

    it("case: search finds content across multiple messages", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const conversationId = Id.generate.conversation();
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.conversationTextSearchIndex.upsert(conversationId, {
            title: [],
            messages: [
              "First message with unique1",
              "Second message with unique2",
              "Third message with unique3",
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
              results1: await repos.conversationTextSearchIndex.search(
                "unique1",
                { limit: 20 },
              ),
              results2: await repos.conversationTextSearchIndex.search(
                "unique2",
                { limit: 20 },
              ),
              results3: await repos.conversationTextSearchIndex.search(
                "unique3",
                { limit: 20 },
              ),
            },
          }),
        );

      // Verify
      expect(results1).toEqual([expect.objectContaining({ conversationId })]);
      expect(results2).toEqual([expect.objectContaining({ conversationId })]);
      expect(results3).toEqual([expect.objectContaining({ conversationId })]);
    });

    it("case: search matches partial words", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const conversationId = Id.generate.conversation();
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.conversationTextSearchIndex.upsert(conversationId, {
            title: ["Conversation about programming"],
            messages: [],
          });
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const results =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: await repos.conversationTextSearchIndex.search(
              "program",
              { limit: 20 },
            ),
          }),
        );

      // Verify
      expect(results).toEqual([expect.objectContaining({ conversationId })]);
    });
  });
});
