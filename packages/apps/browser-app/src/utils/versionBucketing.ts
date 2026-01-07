import type { LiteDocumentVersion } from "@superego/backend";

export interface VersionBucket {
  id: string;
  label: string;
  versions: LiteDocumentVersion[];
  startDate: Date;
  endDate: Date;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

/**
 * Buckets versions by time proximity with dynamic granularity.
 *
 * The algorithm:
 * 1. Calculates time span between oldest and newest versions
 * 2. Determines granularity based on span:
 *    - < 1 day: bucket by hour
 *    - < 1 week: bucket by day
 *    - < 1 month: bucket by week
 *    - Otherwise: bucket by month
 * 3. Large gaps (> 4 hours with no versions) force a new bucket
 * 4. Generates human-readable labels ("Today", "Yesterday", "Jan 5", etc.)
 *
 * @param versions - Array of versions sorted by createdAt DESC (newest first)
 * @param now - Current date (for testing purposes)
 * @returns Array of buckets, each containing versions in that time period
 */
export function bucketVersions(
  versions: LiteDocumentVersion[],
  now: Date = new Date(),
): VersionBucket[] {
  if (versions.length === 0) {
    return [];
  }

  if (versions.length === 1) {
    const version = versions[0]!;
    const date = new Date(version.createdAt);
    return [
      {
        id: `bucket-${version.id}`,
        label: formatBucketLabel(date, now),
        versions: [version],
        startDate: date,
        endDate: date,
      },
    ];
  }

  // Versions are sorted DESC (newest first), so first is newest, last is oldest
  const newestDate = new Date(versions[0]!.createdAt);
  const oldestDate = new Date(versions[versions.length - 1]!.createdAt);
  const timeSpanMs = newestDate.getTime() - oldestDate.getTime();

  // Determine granularity based on time span
  const granularity = determineGranularity(timeSpanMs);

  // Group versions into buckets
  const buckets: VersionBucket[] = [];
  let currentBucket: LiteDocumentVersion[] = [];
  let currentBucketKey: string | null = null;
  let previousVersionDate: Date | null = null;

  for (const version of versions) {
    const versionDate = new Date(version.createdAt);
    const bucketKey = getBucketKey(versionDate, granularity);

    // Check for large gap (> 4 hours) between consecutive versions
    // Only apply gap logic for hourly granularity where it makes sense
    const hasLargeGap =
      granularity === "hour" &&
      previousVersionDate !== null &&
      previousVersionDate.getTime() - versionDate.getTime() > 4 * HOUR_MS;

    if (currentBucketKey === null) {
      // First version
      currentBucketKey = bucketKey;
      currentBucket = [version];
    } else if (bucketKey !== currentBucketKey || hasLargeGap) {
      // New bucket needed
      buckets.push(createBucket(currentBucket, now));
      currentBucket = [version];
      currentBucketKey = bucketKey;
    } else {
      // Same bucket
      currentBucket.push(version);
    }

    previousVersionDate = versionDate;
  }

  // Don't forget the last bucket
  if (currentBucket.length > 0) {
    buckets.push(createBucket(currentBucket, now));
  }

  return buckets;
}

type Granularity = "hour" | "day" | "week" | "month";

function determineGranularity(timeSpanMs: number): Granularity {
  if (timeSpanMs < DAY_MS) {
    return "hour";
  }
  if (timeSpanMs < WEEK_MS) {
    return "day";
  }
  if (timeSpanMs < 4 * WEEK_MS) {
    return "week";
  }
  return "month";
}

function getBucketKey(date: Date, granularity: Granularity): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();

  switch (granularity) {
    case "hour":
      return `${year}-${month}-${day}-${hour}`;
    case "day":
      return `${year}-${month}-${day}`;
    case "week": {
      // Get the start of the week (Sunday)
      const weekStart = new Date(date);
      weekStart.setDate(day - date.getDay());
      return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
    }
    case "month":
      return `${year}-${month}`;
  }
}

function createBucket(versions: LiteDocumentVersion[], now: Date): VersionBucket {
  // Versions within bucket are newest first, so first is newest (end), last is oldest (start)
  const newestDate = new Date(versions[0]!.createdAt);
  const oldestDate = new Date(versions[versions.length - 1]!.createdAt);

  return {
    id: `bucket-${versions[0]!.id}`,
    label: formatBucketLabel(newestDate, now),
    versions,
    startDate: oldestDate,
    endDate: newestDate,
  };
}

function formatBucketLabel(date: Date, now: Date): string {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);

  // Check if it's today
  if (dateStart.getTime() === todayStart.getTime()) {
    return "Today";
  }

  // Check if it's yesterday
  if (dateStart.getTime() === yesterdayStart.getTime()) {
    return "Yesterday";
  }

  // Check if it's within the last 7 days
  const weekAgo = new Date(todayStart);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (dateStart.getTime() > weekAgo.getTime()) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  // Check if it's the same year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Different year - include year
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
