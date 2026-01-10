import type { LiteDocumentVersion } from "@superego/backend";
import { orderBy } from "es-toolkit";
import { DateTime, Duration } from "luxon";
import type Bucket from "./Bucket.js";
import type TimelineNode from "./TimelineNode.js";

/**
 * Creates timeline nodes from a list of document versions. Details:
 *
 * - The latest version is always shown as an individual node (never in a
 *   bucket).
 * - Single-version buckets become individual version nodes.
 * - Multi-version buckets become expandable bucket nodes.
 */
export default function makeTimelineNodes(
  documentVersions: LiteDocumentVersion[],
): TimelineNode[] {
  if (documentVersions.length === 0) {
    return [];
  }

  const sortedDocumentVersions = orderBy(
    documentVersions,
    ["createdAt"],
    ["desc"],
  );
  const buckets = makeBuckets(sortedDocumentVersions);
  const latestVersionId = sortedDocumentVersions[0]!.id;
  const nodes: TimelineNode[] = [];

  for (const bucket of buckets) {
    // Check if the latest version is in this bucket.
    const latestVersion = bucket.documentVersions.find(
      (documentVersion) => documentVersion.id === latestVersionId,
    );

    if (latestVersion) {
      // Extract latest version as individual node.
      nodes.push(bucket.documentVersions[0]!);

      // Handle remaining versions in the bucket (if any).
      const remainingVersions = bucket.documentVersions.slice(1);
      if (remainingVersions.length === 1) {
        nodes.push(remainingVersions[0]!);
      } else if (remainingVersions.length > 1) {
        nodes.push({ ...bucket, documentVersions: remainingVersions });
      }
    } else if (bucket.documentVersions.length === 1) {
      nodes.push(bucket.documentVersions[0]!);
    } else {
      nodes.push(bucket);
    }
  }

  return nodes;
}

const ONE_DAY = Duration.fromObject({ days: 1 });
const ONE_WEEK = Duration.fromObject({ weeks: 1 });
const ONE_MONTH = Duration.fromObject({ months: 1 });

/**
 * Buckets versions by time proximity with dynamic granularity. Algorithm:
 *
 * 1. Calculates time span between oldest and newest versions.
 * 2. Determines granularity based on span:
 *    - < 1 day: bucket by hour.
 *    - < 1 week: bucket by day.
 *    - < 1 month: bucket by week.
 *    - Otherwise: bucket by month.
 * 3. Large gaps (> 4 hours with no versions) force a new bucket.
 */
function makeBuckets(documentVersions: LiteDocumentVersion[]): Bucket[] {
  if (documentVersions.length === 0) {
    return [];
  }

  if (documentVersions.length === 1) {
    const documentVersion = documentVersions[0]!;
    return [
      {
        id: `bucket-${documentVersion.id}`,
        documentVersions: [documentVersion],
        startDate: documentVersion.createdAt,
        endDate: documentVersion.createdAt,
      },
    ];
  }

  // Versions are sorted DESC, so first is newest, last is oldest.
  const newestDateTime = DateTime.fromJSDate(documentVersions[0]!.createdAt);
  const oldestDateTime = DateTime.fromJSDate(
    documentVersions[documentVersions.length - 1]!.createdAt,
  );
  const timeSpan = newestDateTime.diff(oldestDateTime);

  // Determine granularity based on time span.
  const granularity = determineGranularity(timeSpan);

  // Group versions into buckets.
  const buckets: Bucket[] = [];
  let currentBucket: LiteDocumentVersion[] = [];
  let currentBucketKey: string | null = null;
  let previousVersionDateTime: DateTime | null = null;

  for (const documentVersion of documentVersions) {
    const versionDateTime = DateTime.fromJSDate(documentVersion.createdAt);
    const bucketKey = getBucketKey(versionDateTime, granularity);

    // Check for large gap (> 4 hours) between consecutive versions.
    // Only apply gap logic for hourly granularity where it makes sense.
    const hasLargeGap =
      granularity === "hour" &&
      previousVersionDateTime !== null &&
      previousVersionDateTime.diff(versionDateTime) >
        Duration.fromObject({ hours: 4 });

    if (currentBucketKey === null) {
      // First version.
      currentBucketKey = bucketKey;
      currentBucket = [documentVersion];
    } else if (bucketKey !== currentBucketKey || hasLargeGap) {
      // New bucket needed.
      buckets.push(makeBucket(currentBucketKey, currentBucket));
      currentBucket = [documentVersion];
      currentBucketKey = bucketKey;
    } else {
      // Same bucket.
      currentBucket.push(documentVersion);
    }

    previousVersionDateTime = versionDateTime;
  }

  // Don't forget the last bucket.
  if (currentBucket.length > 0) {
    buckets.push(makeBucket(currentBucketKey!, currentBucket));
  }

  return buckets;
}

type Granularity = "hour" | "day" | "week" | "month";

function determineGranularity(timeSpan: Duration): Granularity {
  if (timeSpan < ONE_DAY) {
    return "hour";
  }
  if (timeSpan < ONE_WEEK) {
    return "day";
  }
  if (timeSpan < ONE_MONTH) {
    return "week";
  }
  return "month";
}

function getBucketKey(dateTime: DateTime, granularity: Granularity): string {
  switch (granularity) {
    case "hour":
      return `${dateTime.year}-${dateTime.month}-${dateTime.day}-${dateTime.hour}`;
    case "day":
      return `${dateTime.year}-${dateTime.month}-${dateTime.day}`;
    case "week":
      return `${dateTime.weekYear}-W${dateTime.weekNumber}`;
    case "month":
      return `${dateTime.year}-${dateTime.month}`;
  }
}

function makeBucket(
  bucketKey: string,
  documentVersions: LiteDocumentVersion[],
): Bucket {
  // Versions within bucket are sorted.
  return {
    id: `Bucket_${bucketKey}`,
    documentVersions: documentVersions,
    startDate: documentVersions[documentVersions.length - 1]!.createdAt,
    endDate: documentVersions[0]!.createdAt,
  };
}
