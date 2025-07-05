/**
 * Replaces the value at path of obj. If there's no existing value at path, an
 * error is thrown.
 */
export default function replaceValueAtPath(
  obj: unknown,
  path: string[],
  value: any,
): void {
  if (path.length === 0) {
    throw new Error("Path cannot be empty.");
  }
  const [currentSegment, ...nextPath] = path;
  if (
    !(
      currentSegment !== undefined &&
      typeof obj === "object" &&
      obj !== null &&
      currentSegment in obj
    )
  ) {
    throw new Error("No value found at path.");
  }
  if (nextPath.length === 0) {
    (obj as any)[currentSegment] = value;
  } else {
    const nextObj = (obj as any)[currentSegment];
    replaceValueAtPath(nextObj, nextPath, value);
  }
}
