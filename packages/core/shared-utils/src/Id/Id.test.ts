import { expect, it } from "vitest";
import Id from "./Id.js";

it("collectionCategory", () => {
  // Exercise and verify
  expect(Id.is.collectionCategory(Id.generate.collectionCategory())).toBe(true);
});

it("collection", () => {
  // Exercise and verify
  expect(Id.is.collection(Id.generate.collection())).toBe(true);
});

it("collectionVersion", () => {
  // Exercise and verify
  expect(Id.is.collectionVersion(Id.generate.collectionVersion())).toBe(true);
});

it("document", () => {
  // Exercise and verify
  expect(Id.is.document(Id.generate.document())).toBe(true);
});

it("documentVersion", () => {
  // Exercise and verify
  expect(Id.is.documentVersion(Id.generate.documentVersion())).toBe(true);
});

it("file", () => {
  // Exercise and verify
  expect(Id.is.file(Id.generate.file())).toBe(true);
});

it("conversation", () => {
  // Exercise and verify
  expect(Id.is.conversation(Id.generate.conversation())).toBe(true);
});

it("message", () => {
  // Exercise and verify
  expect(Id.is.message(Id.generate.message())).toBe(true);
});
