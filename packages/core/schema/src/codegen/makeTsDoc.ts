import joinLines from "../utils/joinLines.js";

export default function makeTsDoc(content: string): string {
  const sanitizedContent = content.replaceAll("*/", "*\\/");
  const lines = sanitizedContent.split("\n");
  return lines.length === 1
    ? `/** ${lines[0]} */\n`
    : joinLines([
        "/**",
        ...lines.map((line) => (line !== "" ? ` * ${line}` : " *")),
        " */",
        "",
      ]);
}
