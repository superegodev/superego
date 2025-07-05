export default function getObjectPath(obj: unknown, path: string[]) {
  if (path.length === 0) {
    return obj;
  }
  const [firstSegment, ...rest] = path as [string, ...string[]];
  if (typeof obj === "object" && obj !== null && firstSegment in obj) {
    return getObjectPath(
      (obj as { [firstSegment]: unknown })[firstSegment],
      rest,
    );
  }
  return undefined;
}
