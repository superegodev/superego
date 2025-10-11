import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type FileEntity from "../../../entities/FileEntity.js";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Files", (deps) => {
  it("inserting all", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();

    // Exercise
    const file1: FileEntity = {
      id: Id.generate.file(),
      collectionId: Id.generate.collection(),
      documentId: Id.generate.document(),
      createdWithDocumentVersionId: Id.generate.documentVersion(),
      createdAt: new Date(),
    };
    const file2: FileEntity = {
      id: Id.generate.file(),
      collectionId: Id.generate.collection(),
      documentId: Id.generate.document(),
      createdWithDocumentVersionId: Id.generate.documentVersion(),
      createdAt: new Date(),
    };
    const content1 = new Uint8Array([1, 2, 3, 4]);
    const content2 = new Uint8Array([5, 6, 7, 8]);
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.file.insertAll([
          { ...file1, content: content1 },
          { ...file2, content: content2 },
        ]);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found1 = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.file.find(file1.id),
      }),
    );
    expect(found1).toEqual(file1);
    const foundContent1 =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.file.getContent(file1.id),
        }),
      );
    expect(foundContent1).toEqual(content1);
    const found2 = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.file.find(file2.id),
      }),
    );
    expect(found2).toEqual(file2);
    const foundContent2 =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.file.getContent(file2.id),
        }),
      );
    expect(foundContent2).toEqual(content2);
  });

  it("deleting all by document id", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const document1Id = Id.generate.document();
    const document2Id = Id.generate.document();
    const file1: FileEntity = {
      id: Id.generate.file(),
      collectionId: Id.generate.collection(),
      documentId: document1Id,
      createdWithDocumentVersionId: Id.generate.documentVersion(),
      createdAt: new Date(),
    };
    const file2: FileEntity = {
      id: Id.generate.file(),
      collectionId: Id.generate.collection(),
      documentId: document1Id,
      createdWithDocumentVersionId: Id.generate.documentVersion(),
      createdAt: new Date(),
    };
    const file3: FileEntity = {
      id: Id.generate.file(),
      collectionId: Id.generate.collection(),
      documentId: document2Id,
      createdWithDocumentVersionId: Id.generate.documentVersion(),
      createdAt: new Date(),
    };
    const content = new Uint8Array([1, 2, 3, 4]);
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.file.insertAll([
          { ...file1, content },
          { ...file2, content },
          { ...file3, content },
        ]);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const deletedIds =
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.file.deleteAllWhereDocumentIdEq(document1Id),
        }),
      );

    // Verify
    expect(deletedIds).toEqual([file1.id, file2.id]);
    const found1 = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.file.find(file1.id),
      }),
    );
    expect(found1).toEqual(null);
    const found2 = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.file.find(file2.id),
      }),
    );
    expect(found2).toEqual(null);
    const found3 = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.file.find(file3.id),
      }),
    );
    expect(found3).toEqual(file3);
  });

  describe("finding one", () => {
    it("case: exists => returns it", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const file: FileEntity = {
        id: Id.generate.file(),
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        createdWithDocumentVersionId: Id.generate.documentVersion(),
        createdAt: new Date(),
      };
      const content = new Uint8Array([1, 2, 3, 4]);
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.file.insertAll([{ ...file, content }]);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.file.find(file.id),
        }),
      );

      // Verify
      expect(found).toEqual(file);
    });

    it("case: doesn't exist => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.file.find(Id.generate.file()),
        }),
      );

      // Verify
      expect(found).toEqual(null);
    });
  });

  describe("finding all by ids", () => {
    it("case: no matching files => returns empty array", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.file.findAllWhereIdIn([
            Id.generate.file(),
            Id.generate.file(),
          ]),
        }),
      );

      // Verify
      expect(found).toEqual([]);
    });

    it("case: some matching files => returns them", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const file1: FileEntity = {
        id: Id.generate.file(),
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        createdWithDocumentVersionId: Id.generate.documentVersion(),
        createdAt: new Date(),
      };
      const file2: FileEntity = {
        id: Id.generate.file(),
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        createdWithDocumentVersionId: Id.generate.documentVersion(),
        createdAt: new Date(),
      };
      const file3: FileEntity = {
        id: Id.generate.file(),
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        createdWithDocumentVersionId: Id.generate.documentVersion(),
        createdAt: new Date(),
      };
      const content = new Uint8Array([1, 2, 3, 4]);
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.file.insertAll([
            { ...file1, content },
            { ...file2, content },
            { ...file3, content },
          ]);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const found = await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => ({
          action: "commit",
          returnValue: await repos.file.findAllWhereIdIn([file1.id, file3.id]),
        }),
      );

      // Verify
      expect(found).toEqual([file1, file3]);
    });
  });

  describe("getting content", () => {
    it("case: exists => returns content", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();
      const file: FileEntity = {
        id: Id.generate.file(),
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
        createdWithDocumentVersionId: Id.generate.documentVersion(),
        createdAt: new Date(),
      };
      const content = new Uint8Array([1, 2, 3, 4, 5]);
      await dataRepositoriesManager.runInSerializableTransaction(
        async (repos) => {
          await repos.file.insertAll([{ ...file, content }]);
          return { action: "commit", returnValue: null };
        },
      );

      // Exercise
      const foundContent =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: await repos.file.getContent(file.id),
          }),
        );

      // Verify
      expect(foundContent).toEqual(content);
    });

    it("case: doesn't exist => returns null", async () => {
      // Setup SUT
      const { dataRepositoriesManager } = deps();

      // Exercise
      const foundContent =
        await dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => ({
            action: "commit",
            returnValue: await repos.file.getContent(Id.generate.file()),
          }),
        );

      // Verify
      expect(foundContent).toEqual(null);
    });
  });
});
