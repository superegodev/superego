export interface PathSegment {
  type: "StructProperty" | "ListItem";
  value: string;
}

export default function parsePath(path: string): PathSegment[] {
  const normalizedPath = path
    // Support `["prop"]` syntax.
    .replaceAll('"', "")
    // Support `[0]` or `[0].` syntax
    .replaceAll("[", ".")
    .replaceAll("].", ".")
    .replaceAll("]", ".")
    // Remove leftover dots.
    .replaceAll(/\.+/g, ".")
    .replace(/^\./, "")
    .replace(/\.$/, "");
  if (normalizedPath === "") {
    return [];
  }
  return normalizedPath.split(".").map((segmentValue) => ({
    type:
      segmentValue === "$" || /^\d/.test(segmentValue)
        ? "ListItem"
        : "StructProperty",
    value: segmentValue,
  }));
}
