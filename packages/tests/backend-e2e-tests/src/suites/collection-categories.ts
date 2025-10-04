import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { sortBy } from "es-toolkit";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Collection categories", (deps) => {
  describe("create", () => {
    it("error: CollectionCategoryNameNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collectionCategories.create({
        name: "",
        icon: null,
        parentId: null,
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionCategoryNameNotValid",
          details: {
            collectionCategoryId: null,
            issues: [
              {
                message: "Invalid length: Expected >=1 but received 0",
                path: undefined,
              },
            ],
          },
        },
      });
    });

    it("error: CollectionCategoryIconNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collectionCategories.create({
        name: "name",
        icon: "not-an-emoji",
        parentId: null,
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionCategoryIconNotValid",
          details: {
            collectionCategoryId: null,
            issues: [
              {
                message: 'Invalid emoji: Received "not-an-emoji"',
                path: undefined,
              },
            ],
          },
        },
      });
    });

    it("error: ParentCollectionCategoryNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const parentId = Id.generate.collectionCategory();
      const result = await backend.collectionCategories.create({
        name: "name",
        icon: null,
        parentId: parentId,
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ParentCollectionCategoryNotFound",
          details: { parentId },
        },
      });
    });

    it("success: creates (case: w/o icon, w/o parentId)", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collectionCategories.create({
        name: "name",
        icon: null,
        parentId: null,
      });

      // Verify
      expect(result).toEqual({
        success: true,
        data: {
          id: expect.id("CollectionCategory"),
          name: "name",
          icon: null,
          parentId: null,
          createdAt: expect.dateCloseToNow(),
        },
        error: null,
      });
      const listResult = await backend.collectionCategories.list();
      expect(listResult).toEqual({
        success: true,
        data: [result.data],
        error: null,
      });
    });

    it("success: creates (case: w/ icon, w/ parentId)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createParentResult = await backend.collectionCategories.create({
        name: "parent",
        icon: null,
        parentId: null,
      });
      assert.isTrue(createParentResult.success);

      // Exercise
      const createChildResult = await backend.collectionCategories.create({
        name: "child",
        icon: "😃",
        parentId: createParentResult.data.id,
      });

      // Verify
      expect(createChildResult).toEqual({
        success: true,
        data: {
          id: expect.id("CollectionCategory"),
          name: "child",
          icon: "😃",
          parentId: createParentResult.data.id,
          createdAt: expect.dateCloseToNow(),
        },
        error: null,
      });
      assert.isTrue(createChildResult.success);
      const listResult = await backend.collectionCategories.list();
      expect(listResult).toEqual({
        success: true,
        data: sortBy(
          [createParentResult.data, createChildResult.data],
          ["name"],
        ),
        error: null,
      });
    });
  });

  describe("update", () => {
    it("error: CollectionCategoryNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const id = Id.generate.collectionCategory();
      const result = await backend.collectionCategories.update(id, {
        name: "name",
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionCategoryNotFound",
          details: {
            collectionCategoryId: id,
          },
        },
      });
    });

    it("error: CollectionCategoryNameNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collectionCategories.create({
        name: "name",
        icon: null,
        parentId: null,
      });
      assert.isTrue(createResult.success);

      // Exercise
      const updateResult = await backend.collectionCategories.update(
        createResult.data.id,
        {
          name: "a".repeat(65),
        },
      );

      // Verify
      expect(updateResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionCategoryNameNotValid",
          details: {
            collectionCategoryId: createResult.data.id,
            issues: [
              {
                message: "Invalid length: Expected <=64 but received 65",
                path: undefined,
              },
            ],
          },
        },
      });
    });

    it("error: CollectionCategoryIconNotValid", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collectionCategories.create({
        name: "name",
        icon: null,
        parentId: null,
      });
      assert.isTrue(createResult.success);

      // Exercise
      const updateResult = await backend.collectionCategories.update(
        createResult.data.id,
        {
          icon: "not-an-emoji",
        },
      );

      // Verify
      expect(updateResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionCategoryIconNotValid",
          details: {
            collectionCategoryId: createResult.data.id,
            issues: [
              {
                message: 'Invalid emoji: Received "not-an-emoji"',
                path: undefined,
              },
            ],
          },
        },
      });
    });

    it("error: ParentCollectionCategoryNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collectionCategories.create({
        name: "name",
        icon: null,
        parentId: null,
      });
      assert.isTrue(createResult.success);

      // Exercise
      const parentId = Id.generate.collectionCategory();
      const updateResult = await backend.collectionCategories.update(
        createResult.data.id,
        { parentId },
      );

      // Verify
      expect(updateResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ParentCollectionCategoryNotFound",
          details: { parentId },
        },
      });
    });

    it("error: ParentCollectionCategoryIsDescendant", async () => {
      // Setup SUT
      const { backend } = deps();
      const createParentResult = await backend.collectionCategories.create({
        name: "parent",
        icon: null,
        parentId: null,
      });
      assert.isTrue(createParentResult.success);
      const createChildResult = await backend.collectionCategories.create({
        name: "child",
        icon: null,
        parentId: createParentResult.data.id,
      });
      assert.isTrue(createChildResult.success);

      // Exercise
      const updateParentResult = await backend.collectionCategories.update(
        createParentResult.data.id,
        { parentId: createChildResult.data.id },
      );

      // Verify
      expect(updateParentResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "ParentCollectionCategoryIsDescendant",
          details: {
            parentId: createChildResult.data.id,
          },
        },
      });
    });

    it("success: updates", async () => {
      // Setup SUT
      const { backend } = deps();
      const createParentResult = await backend.collectionCategories.create({
        name: "parent",
        icon: null,
        parentId: null,
      });
      assert.isTrue(createParentResult.success);
      const createChildResult = await backend.collectionCategories.create({
        name: "child",
        icon: null,
        parentId: null,
      });
      assert.isTrue(createChildResult.success);

      // Exercise
      const updateChildResult = await backend.collectionCategories.update(
        createChildResult.data.id,
        {
          name: "updated-child",
          icon: "😃",
          parentId: createParentResult.data.id,
        },
      );

      // Verify
      expect(updateChildResult).toEqual({
        success: true,
        data: {
          id: createChildResult.data.id,
          name: "updated-child",
          icon: "😃",
          parentId: createParentResult.data.id,
          createdAt: createChildResult.data.createdAt,
        },
        error: null,
      });
      assert.isTrue(updateChildResult.success);
      const listResult = await backend.collectionCategories.list();
      expect(listResult).toEqual({
        success: true,
        data: sortBy(
          [createParentResult.data, updateChildResult.data],
          ["name"],
        ),
        error: null,
      });
    });
  });

  describe("delete", () => {
    it("error: CollectionCategoryNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const id = Id.generate.collectionCategory();
      const result = await backend.collectionCategories.delete(id);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionCategoryNotFound",
          details: {
            collectionCategoryId: id,
          },
        },
      });
    });

    it("error: CollectionCategoryHasChildren (case: child = collection category)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createParentResult = await backend.collectionCategories.create({
        name: "parent",
        icon: null,
        parentId: null,
      });
      assert.isTrue(createParentResult.success);
      const createChildResult = await backend.collectionCategories.create({
        name: "child",
        icon: null,
        parentId: createParentResult.data.id,
      });
      assert.isTrue(createChildResult.success);

      // Exercise
      const deleteResult = await backend.collectionCategories.delete(
        createParentResult.data.id,
      );

      // Verify
      expect(deleteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionCategoryHasChildren",
          details: {
            collectionCategoryId: createParentResult.data.id,
          },
        },
      });
    });

    it("error: CollectionCategoryHasChildren (case: child = collection)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createParentResult = await backend.collectionCategories.create({
        name: "parent",
        icon: null,
        parentId: null,
      });
      assert.isTrue(createParentResult.success);
      const createChildCollectionResult = await backend.collections.create(
        {
          name: "child",
          icon: null,
          collectionCategoryId: createParentResult.data.id,
          description: null,
          assistantInstructions: null,
        },
        {
          types: { Root: { dataType: DataType.Struct, properties: {} } },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled: "export default function getContentSummary() {}",
          },
        },
      );
      assert.isTrue(createChildCollectionResult.success);

      // Exercise
      const deleteResult = await backend.collectionCategories.delete(
        createParentResult.data.id,
      );

      // Verify
      expect(deleteResult).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionCategoryHasChildren",
          details: {
            collectionCategoryId: createParentResult.data.id,
          },
        },
      });
    });

    it("success: deletes", async () => {
      // Setup SUT
      const { backend } = deps();
      const createResult = await backend.collectionCategories.create({
        name: "name",
        icon: null,
        parentId: null,
      });
      assert.isTrue(createResult.success);

      // Exercise
      const deleteResult = await backend.collectionCategories.delete(
        createResult.data.id,
      );

      // Verify
      expect(deleteResult).toEqual({
        success: true,
        data: null,
        error: null,
      });
      const listResult = await backend.collectionCategories.list();
      expect(listResult).toEqual({
        success: true,
        data: [],
        error: null,
      });
    });
  });

  describe("list", () => {
    it("success: empty list", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.collectionCategories.list();

      // Verify
      expect(result).toEqual({
        success: true,
        data: [],
        error: null,
      });
    });

    it("success: non-empty list, sorted by name", async () => {
      // Setup SUT
      const { backend } = deps();
      const zetaCreateResult = await backend.collectionCategories.create({
        name: "zeta",
        icon: null,
        parentId: null,
      });
      assert.isTrue(zetaCreateResult.success);
      const alphaCreateResult = await backend.collectionCategories.create({
        name: "alpha",
        icon: "😃",
        parentId: null,
      });
      assert.isTrue(alphaCreateResult.success);
      const betaCreateResult = await backend.collectionCategories.create({
        name: "beta",
        icon: null,
        parentId: null,
      });
      assert.isTrue(betaCreateResult.success);

      // Exercise
      const listResult = await backend.collectionCategories.list();

      // Verify
      expect(listResult).toEqual({
        success: true,
        data: [
          alphaCreateResult.data,
          betaCreateResult.data,
          zetaCreateResult.data,
        ],
        error: null,
      });
    });
  });
});
