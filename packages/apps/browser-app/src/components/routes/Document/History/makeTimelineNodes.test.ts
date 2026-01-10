import type { MinimalDocumentVersion } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { expect, it } from "vitest";
import type Bucket from "./Bucket.js";
import makeTimelineNodes from "./makeTimelineNodes.js";

function makeDocumentVersion(createdAt: Date): MinimalDocumentVersion {
  return {
    id: Id.generate.documentVersion(),
    createdAt,
  } as MinimalDocumentVersion;
}

function isBucket(node: unknown): node is Bucket {
  return (
    typeof node === "object" && node !== null && "documentVersions" in node
  );
}

it("returns empty array for empty input", () => {
  // Exercise
  const nodes = makeTimelineNodes([]);

  // Verify
  expect(nodes).toEqual([]);
});

it("returns single version as-is", () => {
  // Exercise
  const version = makeDocumentVersion(new Date("2025-01-10T10:00:00Z"));
  const nodes = makeTimelineNodes([version]);

  // Verify
  expect(nodes).toHaveLength(1);
  expect(nodes[0]).toBe(version);
});

it("keeps latest version as individual node even when in same bucket", () => {
  // Exercise
  const versions = [
    makeDocumentVersion(new Date("2025-01-10T10:00:00Z")),
    makeDocumentVersion(new Date("2025-01-10T10:30:00Z")),
    makeDocumentVersion(new Date("2025-01-10T11:00:00Z")),
  ];
  const nodes = makeTimelineNodes(versions);

  // Verify
  expect(nodes).toHaveLength(2);
  expect(nodes[0]).toBe(versions[2]); // Latest is individual.
  expect(isBucket(nodes[1])).toBe(true); // Remaining are bucketed.
  expect((nodes[1] as Bucket).documentVersions).toHaveLength(2);
});

it("groups versions by hour when span < 1 day", () => {
  // Exercise
  const versions = [
    makeDocumentVersion(new Date("2025-01-10T10:00:00Z")),
    makeDocumentVersion(new Date("2025-01-10T10:30:00Z")),
    makeDocumentVersion(new Date("2025-01-10T12:00:00Z")),
    makeDocumentVersion(new Date("2025-01-10T12:30:00Z")),
  ];
  const nodes = makeTimelineNodes(versions);

  // Verify: latest individual + 12:00 individual + bucket for 10:00 hour.
  // (12:00 becomes individual because after extracting latest, only 1 remains.)
  expect(nodes).toHaveLength(3);
  expect(nodes[0]).toBe(versions[3]); // Latest (12:30).
  expect(nodes[1]).toBe(versions[2]); // 12:00 (single, not bucketed).
  expect(isBucket(nodes[2])).toBe(true); // 10:00 bucket (10:00 and 10:30).
  expect((nodes[2] as Bucket).documentVersions).toHaveLength(2);
});

it("groups versions by day when span is between 1 day and 1 week", () => {
  // Exercise
  const versions = [
    makeDocumentVersion(new Date("2025-01-10T10:00:00Z")),
    makeDocumentVersion(new Date("2025-01-10T14:00:00Z")),
    makeDocumentVersion(new Date("2025-01-12T10:00:00Z")),
    makeDocumentVersion(new Date("2025-01-12T14:00:00Z")),
  ];
  const nodes = makeTimelineNodes(versions);

  // Verify: latest individual + Jan 12 individual + bucket for Jan 10.
  // (Jan 12 becomes individual because after extracting latest, only 1 remains.)
  expect(nodes).toHaveLength(3);
  expect(nodes[0]).toBe(versions[3]); // Latest.
  expect(nodes[1]).toBe(versions[2]); // Jan 12 (single, not bucketed).
  expect(isBucket(nodes[2])).toBe(true); // Jan 10 bucket.
  expect((nodes[2] as Bucket).documentVersions).toHaveLength(2);
});

it("groups versions by ISO week when span is between 1 week and 1 month", () => {
  // Exercise
  const versions = [
    makeDocumentVersion(new Date("2025-01-06T10:00:00Z")), // Week 2.
    makeDocumentVersion(new Date("2025-01-08T10:00:00Z")), // Week 2.
    makeDocumentVersion(new Date("2025-01-13T10:00:00Z")), // Week 3.
    makeDocumentVersion(new Date("2025-01-15T10:00:00Z")), // Week 3.
  ];
  const nodes = makeTimelineNodes(versions);

  // Verify: latest individual + week 3 individual + bucket for week 2.
  // (Week 3 becomes individual because after extracting latest, only 1 remains.)
  expect(nodes).toHaveLength(3);
  expect(nodes[0]).toBe(versions[3]); // Latest.
  expect(nodes[1]).toBe(versions[2]); // Week 3 (single, not bucketed).
  expect(isBucket(nodes[2])).toBe(true);
  expect((nodes[2] as Bucket).id).toContain("W2");
});

it("groups versions by month when span > 1 month", () => {
  // Exercise
  const versions = [
    makeDocumentVersion(new Date("2025-01-15T10:00:00Z")),
    makeDocumentVersion(new Date("2025-02-15T10:00:00Z")),
    makeDocumentVersion(new Date("2025-03-15T10:00:00Z")),
  ];
  const nodes = makeTimelineNodes(versions);

  // Verify: latest individual + Jan bucket + Feb bucket.
  expect(nodes).toHaveLength(3);
  expect(nodes[0]).toBe(versions[2]); // Latest (March).
  expect(nodes[1]).toBe(versions[1]); // Feb (single, so not bucketed).
  expect(nodes[2]).toBe(versions[0]); // Jan (single, so not bucketed).
});
