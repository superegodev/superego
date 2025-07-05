export default function joinLines(lines: (string | null)[]): string {
  return lines.filter((line) => line !== null).join("\n");
}
