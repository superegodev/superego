import joinLines from "./joinLines.js";

export default function makeTsDoc(content: string): string {
  const sanitizedContent = content.replaceAll("*/", "*\\/");
  return joinLines([
    "/**",
    ...sanitizedContent
      .split("\n")
      .map((line) => (line !== "" ? ` * ${line}` : " *")),
    " */",
    "",
  ]);
}
