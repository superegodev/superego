export default function indent(codeBlock: string, levels = 1): string {
  return codeBlock
    .split("\n")
    .map((line) => (line !== "" ? `${"  ".repeat(levels)}${line}` : line))
    .join("\n");
}
