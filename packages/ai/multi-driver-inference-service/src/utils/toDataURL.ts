import toBase64 from "./toBase64.js";

export default function toDataURL(
  content: Uint8Array<ArrayBuffer>,
  mimeType: string,
): string {
  return `data:${mimeType};base64,${toBase64(content)}`;
}
