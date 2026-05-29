import { Id } from "@superego/shared-utils";
import { expect, it } from "vitest";
import applyDocumentContentPatch from "./applyDocumentContentPatch.js";

it("applies a patch to cloned content", () => {
  // Setup SUT
  const collectionId = Id.generate.collection();
  const documentId = Id.generate.document();
  const latestVersionId = Id.generate.documentVersion();
  const content = {
    title: "old",
    nested: {
      items: ["one", "two"],
    },
  };

  // Exercise
  const result = applyDocumentContentPatch(
    collectionId,
    documentId,
    latestVersionId,
    content,
    [
      { op: "replace", path: "/title", value: "new" },
      { op: "add", path: "/nested/items/1", value: "one and a half" },
    ],
  );

  // Verify
  expect(result).toEqual({
    success: true,
    data: {
      title: "new",
      nested: {
        items: ["one", "one and a half", "two"],
      },
    },
    error: null,
  });
  expect(content).toEqual({
    title: "old",
    nested: {
      items: ["one", "two"],
    },
  });
});

it("does not mutate patch operations", () => {
  // Setup SUT
  const collectionId = Id.generate.collection();
  const documentId = Id.generate.document();
  const latestVersionId = Id.generate.documentVersion();
  const patch = [{ op: "replace" as const, path: "/title", value: "new" }];

  // Exercise
  applyDocumentContentPatch(
    collectionId,
    documentId,
    latestVersionId,
    { title: "old" },
    patch,
  );

  // Verify
  expect(patch).toEqual([{ op: "replace", path: "/title", value: "new" }]);
});

it("returns DocumentContentPatchNotValid when a path is missing", () => {
  // Setup SUT
  const collectionId = Id.generate.collection();
  const documentId = Id.generate.document();
  const latestVersionId = Id.generate.documentVersion();

  // Exercise
  const result = applyDocumentContentPatch(
    collectionId,
    documentId,
    latestVersionId,
    { title: "old" },
    [{ op: "replace", path: "/missing", value: "new" }],
  );

  // Verify
  expect(result).toEqual({
    success: false,
    data: null,
    error: {
      name: "DocumentContentPatchNotValid",
      details: {
        collectionId,
        documentId,
        latestVersionId,
        operationIndex: 0,
        path: "/missing",
        cause: expect.stringContaining(
          "Cannot perform the operation at a path that does not exist",
        ),
      },
    },
  });
});

it("returns DocumentContentPatchNotValid when a test operation fails", () => {
  // Setup SUT
  const collectionId = Id.generate.collection();
  const documentId = Id.generate.document();
  const latestVersionId = Id.generate.documentVersion();

  // Exercise
  const result = applyDocumentContentPatch(
    collectionId,
    documentId,
    latestVersionId,
    { title: "old" },
    [{ op: "test", path: "/title", value: "new" }],
  );

  // Verify
  expect(result).toEqual({
    success: false,
    data: null,
    error: {
      name: "DocumentContentPatchNotValid",
      details: {
        collectionId,
        documentId,
        latestVersionId,
        operationIndex: 0,
        path: "/title",
        cause: expect.stringContaining("Test operation failed"),
      },
    },
  });
});
