import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export default function writeFile(
  filePath: string,
  content: string,
  options?: { readonly?: boolean; trailingNewline?: boolean },
) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, options?.trailingNewline ? `${content}\n` : content, {
    mode: options?.readonly ? 0o444 : undefined,
  });
}
