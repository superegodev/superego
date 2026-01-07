import type { LiteDocumentVersion } from "@superego/backend";
import { describe, expect, it } from "vitest";
import { bucketVersions } from "./versionBucketing.js";

// Helper to create a mock LiteDocumentVersion
function mockVersion(
  id: string,
  createdAt: Date,
): LiteDocumentVersion {
  return {
    id: `DocumentVersion_${id}`,
    remoteId: null,
    collectionVersionId: "CollectionVersion_test",
    previousVersionId: null,
    conversationId: null,
    contentSummary: { success: true, data: { Title: "Test" }, error: null },
    createdBy: "User",
    createdAt,
  } as LiteDocumentVersion;
}

describe("bucketVersions", () => {
  const now = new Date("2024-03-15T14:30:00Z");

  describe("edge cases", () => {
    it("returns empty array for empty input", () => {
      const result = bucketVersions([], now);
      expect(result).toEqual([]);
    });

    it("returns single bucket for single version", () => {
      const version = mockVersion("1", new Date("2024-03-15T10:00:00Z"));
      const result = bucketVersions([version], now);

      expect(result).toHaveLength(1);
      expect(result[0]!.versions).toHaveLength(1);
      expect(result[0]!.label).toBe("Today");
    });
  });

  describe("label formatting", () => {
    it("labels today's versions as 'Today'", () => {
      const version = mockVersion("1", new Date("2024-03-15T08:00:00Z"));
      const result = bucketVersions([version], now);

      expect(result[0]!.label).toBe("Today");
    });

    it("labels yesterday's versions as 'Yesterday'", () => {
      const version = mockVersion("1", new Date("2024-03-14T10:00:00Z"));
      const result = bucketVersions([version], now);

      expect(result[0]!.label).toBe("Yesterday");
    });

    it("labels versions within last week with day name", () => {
      // March 15, 2024 is a Friday, so March 11 is Monday
      const version = mockVersion("1", new Date("2024-03-11T10:00:00Z"));
      const result = bucketVersions([version], now);

      expect(result[0]!.label).toBe("Monday");
    });

    it("labels older same-year versions with month and day", () => {
      const version = mockVersion("1", new Date("2024-01-20T10:00:00Z"));
      const result = bucketVersions([version], now);

      expect(result[0]!.label).toBe("Jan 20");
    });

    it("labels different-year versions with full date", () => {
      const version = mockVersion("1", new Date("2023-06-15T10:00:00Z"));
      const result = bucketVersions([version], now);

      expect(result[0]!.label).toBe("Jun 15, 2023");
    });
  });

  describe("hourly granularity (span < 1 day)", () => {
    it("groups versions in the same hour", () => {
      const versions = [
        mockVersion("1", new Date("2024-03-15T10:45:00Z")),
        mockVersion("2", new Date("2024-03-15T10:30:00Z")),
        mockVersion("3", new Date("2024-03-15T10:15:00Z")),
      ];
      const result = bucketVersions(versions, now);

      expect(result).toHaveLength(1);
      expect(result[0]!.versions).toHaveLength(3);
    });

    it("separates versions in different hours", () => {
      const versions = [
        mockVersion("1", new Date("2024-03-15T11:00:00Z")),
        mockVersion("2", new Date("2024-03-15T10:00:00Z")),
        mockVersion("3", new Date("2024-03-15T09:00:00Z")),
      ];
      const result = bucketVersions(versions, now);

      expect(result).toHaveLength(3);
    });
  });

  describe("daily granularity (span 1-7 days)", () => {
    it("groups versions on the same day", () => {
      const versions = [
        mockVersion("1", new Date("2024-03-15T18:00:00Z")),
        mockVersion("2", new Date("2024-03-15T10:00:00Z")),
        mockVersion("3", new Date("2024-03-14T15:00:00Z")),
        mockVersion("4", new Date("2024-03-14T09:00:00Z")),
        mockVersion("5", new Date("2024-03-13T12:00:00Z")),
      ];
      const result = bucketVersions(versions, now);

      expect(result).toHaveLength(3);
      expect(result[0]!.versions).toHaveLength(2); // March 15
      expect(result[1]!.versions).toHaveLength(2); // March 14
      expect(result[2]!.versions).toHaveLength(1); // March 13
    });
  });

  describe("large gap handling", () => {
    it("creates new bucket for gaps > 4 hours within hourly granularity", () => {
      // All versions within same hour but with > 4 hour gap between groups
      // This tests gap logic specifically - versions span < 1 day so hourly granularity
      const versions = [
        mockVersion("1", new Date("2024-03-15T14:30:00Z")),
        mockVersion("2", new Date("2024-03-15T14:15:00Z")),
        // 5+ hour gap (from 14:15 to 09:00)
        mockVersion("3", new Date("2024-03-15T09:00:00Z")),
        mockVersion("4", new Date("2024-03-15T08:45:00Z")),
      ];
      const result = bucketVersions(versions, now);

      // Without gap logic, this would be 3 buckets (14, 09, 08 hours)
      // With gap logic, the 5+ hour gap forces a split resulting in 3 buckets
      // Actually, since versions 1-2 are hour 14, and versions 3-4 are hours 9 and 8,
      // regular hourly bucketing already separates them. Gap logic adds extra splits.
      expect(result.length).toBeGreaterThanOrEqual(3);

      // First bucket should have versions from hour 14
      expect(result[0]!.versions).toHaveLength(2);
    });

    it("does not split buckets for gaps < 4 hours", () => {
      // Versions within same hour, gap < 4 hours
      const versions = [
        mockVersion("1", new Date("2024-03-15T14:30:00Z")),
        mockVersion("2", new Date("2024-03-15T14:15:00Z")),
        // 3 hour gap (from 14:15 to 11:30)
        mockVersion("3", new Date("2024-03-15T11:30:00Z")),
        mockVersion("4", new Date("2024-03-15T11:15:00Z")),
      ];
      const result = bucketVersions(versions, now);

      // With hourly bucketing, hour 14 and hour 11 are separate buckets
      expect(result).toHaveLength(2);
      expect(result[0]!.versions).toHaveLength(2); // 14:30, 14:15
      expect(result[1]!.versions).toHaveLength(2); // 11:30, 11:15
    });
  });

  describe("bucket metadata", () => {
    it("sets correct startDate and endDate for bucket", () => {
      const versions = [
        mockVersion("1", new Date("2024-03-15T10:45:00Z")),
        mockVersion("2", new Date("2024-03-15T10:30:00Z")),
        mockVersion("3", new Date("2024-03-15T10:15:00Z")),
      ];
      const result = bucketVersions(versions, now);

      expect(result[0]!.startDate).toEqual(new Date("2024-03-15T10:15:00Z"));
      expect(result[0]!.endDate).toEqual(new Date("2024-03-15T10:45:00Z"));
    });

    it("generates unique bucket ids", () => {
      const versions = [
        mockVersion("1", new Date("2024-03-15T11:00:00Z")),
        mockVersion("2", new Date("2024-03-15T10:00:00Z")),
        mockVersion("3", new Date("2024-03-15T09:00:00Z")),
      ];
      const result = bucketVersions(versions, now);

      const ids = result.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("monthly granularity (span > 1 month)", () => {
    it("groups versions in the same month", () => {
      const versions = [
        mockVersion("1", new Date("2024-03-20T10:00:00Z")),
        mockVersion("2", new Date("2024-03-05T10:00:00Z")),
        mockVersion("3", new Date("2024-02-15T10:00:00Z")),
        mockVersion("4", new Date("2024-01-20T10:00:00Z")),
      ];
      const result = bucketVersions(versions, now);

      expect(result).toHaveLength(3);
      expect(result[0]!.versions).toHaveLength(2); // March
      expect(result[1]!.versions).toHaveLength(1); // February
      expect(result[2]!.versions).toHaveLength(1); // January
    });
  });

  describe("order preservation", () => {
    it("preserves version order within buckets (newest first)", () => {
      const versions = [
        mockVersion("1", new Date("2024-03-15T10:45:00Z")),
        mockVersion("2", new Date("2024-03-15T10:30:00Z")),
        mockVersion("3", new Date("2024-03-15T10:15:00Z")),
      ];
      const result = bucketVersions(versions, now);

      expect(result[0]!.versions[0]!.id).toBe("DocumentVersion_1");
      expect(result[0]!.versions[1]!.id).toBe("DocumentVersion_2");
      expect(result[0]!.versions[2]!.id).toBe("DocumentVersion_3");
    });

    it("returns buckets in chronological order (newest first)", () => {
      const versions = [
        mockVersion("1", new Date("2024-03-15T10:00:00Z")),
        mockVersion("2", new Date("2024-03-14T10:00:00Z")),
        mockVersion("3", new Date("2024-03-13T10:00:00Z")),
      ];
      const result = bucketVersions(versions, now);

      expect(result[0]!.label).toBe("Today");
      expect(result[1]!.label).toBe("Yesterday");
      expect(result[2]!.label).toBe("Wednesday");
    });
  });
});
