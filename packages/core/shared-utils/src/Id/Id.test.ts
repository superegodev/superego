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

it("app", () => {
  // Exercise and verify
  expect(Id.is.app(Id.generate.app())).toBe(true);
});

it("appVersion", () => {
  // Exercise and verify
  expect(Id.is.appVersion(Id.generate.appVersion())).toBe(true);
});

it("backgroundJob", () => {
  // Exercise and verify
  expect(Id.is.backgroundJob(Id.generate.backgroundJob())).toBe(true);
});
