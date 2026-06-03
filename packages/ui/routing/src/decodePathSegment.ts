export default function decodePathSegment<Segment extends string>(
  value: string | undefined,
): Segment {
  if (value === undefined) {
    throw new Error("Missing path segment");
  }
  try {
    return decodeURIComponent(value) as Segment;
  } catch {
    return value as Segment;
  }
}
