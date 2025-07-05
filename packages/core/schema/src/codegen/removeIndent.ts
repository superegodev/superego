export default function removeIndent(codeBlock: string, levels = 1): string {
  return codeBlock
    .split("\n")
    .map((line) => line.replace(new RegExp(`^${"  ".repeat(levels)}`), ""))
    .join("\n");
}
