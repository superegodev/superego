import { Base64Url } from "@superego/shared-utils";

export default function decodeInlineBase64Asset(
  value: string,
): Uint8Array<ArrayBuffer> {
  const base64Value = value.includes(",") ? value.split(",")[1]! : value;
  const base64UrlValue = base64Value
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return Base64Url.decodeToBytes(base64UrlValue);
}
