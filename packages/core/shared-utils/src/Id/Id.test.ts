import { expect, it } from "vitest";
import Id from "./Id.js";

it("protoCollectionCategory", () => {
  // Exercise and verify
  expect(
    Id.is.protoCollectionCategory(Id.generate.protoCollectionCategory(0)),
  ).toBe(true);
  expect(
    Id.extractIndex.protoCollectionCategory(
      Id.generate.protoCollectionCategory(0),
    ),
  ).toBe(0);
  expect(
    Id.extractIndex.protoCollectionCategory(
      Id.generate.protoCollectionCategory(42),
    ),
  ).toBe(42);
});

it("collectionCategory", () => {
  // Exercise and verify
  expect(Id.is.collectionCategory(Id.generate.collectionCategory())).toBe(true);
});

it("protoCollection", () => {
  // Exercise and verify
  expect(Id.is.protoCollection(Id.generate.protoCollection(0))).toBe(true);
  expect(Id.extractIndex.protoCollection(Id.generate.protoCollection(0))).toBe(
    0,
  );
  expect(Id.extractIndex.protoCollection(Id.generate.protoCollection(42))).toBe(
    42,
  );
});

it("collection", () => {
  // Exercise and verify
  expect(Id.is.collection(Id.generate.collection())).toBe(true);
});

it("collectionVersion", () => {
  // Exercise and verify
  expect(Id.is.collectionVersion(Id.generate.collectionVersion())).toBe(true);
});

it("protoDocument", () => {
  // Exercise and verify
  expect(Id.is.protoDocument(Id.generate.protoDocument(0))).toBe(true);
  expect(Id.extractIndex.protoDocument(Id.generate.protoDocument(0))).toBe(0);
  expect(Id.extractIndex.protoDocument(Id.generate.protoDocument(42))).toBe(42);
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

it("protoApp", () => {
  // Exercise and verify
  expect(Id.is.protoApp(Id.generate.protoApp(0))).toBe(true);
  expect(Id.extractIndex.protoApp(Id.generate.protoApp(0))).toBe(0);
  expect(Id.extractIndex.protoApp(Id.generate.protoApp(42))).toBe(42);
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
