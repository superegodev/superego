export default function formatRange(
  linesBefore: number,
  lineCount: number,
): string {
  return `${lineCount === 0 ? linesBefore : linesBefore + 1},${lineCount}`;
}
