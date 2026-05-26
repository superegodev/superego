export default function splitLines(source: string): string[] {
  if (source.length === 0) {
    return [];
  }
  return source.endsWith("\n")
    ? source.slice(0, -1).split("\n")
    : source.split("\n");
}
