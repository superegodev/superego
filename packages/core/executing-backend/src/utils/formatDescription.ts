const tmpParagraphSeparator = crypto.randomUUID();

export default function formatDescription(description: string): string {
  return description
    .trim()
    .replaceAll(/^ +/gm, "")
    .replaceAll("\n\n", tmpParagraphSeparator)
    .replaceAll("\n", " ")
    .replaceAll(tmpParagraphSeparator, "\n");
}
