import writeFile from "./writeFile.js";

export default function writeJsonFile(
  filePath: string,
  data: unknown,
  options?: { readonly?: boolean },
) {
  writeFile(filePath, JSON.stringify(data, null, 2), {
    ...options,
    trailingNewline: true,
  });
}
