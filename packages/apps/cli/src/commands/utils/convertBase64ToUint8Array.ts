/**
 * Recursively walks a value and converts objects that look like a JSON-encoded
 * ProtoFile ({name: string, mimeType: string, content: string}) by decoding
 * `content` from a base64 string to a Uint8Array.
 *
 * Mutates the value in place and returns it.
 */
export default function convertBase64ToUint8Array<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      convertBase64ToUint8Array(value[i]);
    }
    return value;
  }

  const obj = value as Record<string, unknown>;

  if (
    typeof obj["name"] === "string" &&
    typeof obj["mimeType"] === "string" &&
    typeof obj["content"] === "string"
  ) {
    obj["content"] = Uint8Array.from(
      Buffer.from(obj["content"] as string, "base64"),
    );
    return value;
  }

  for (const key of Object.keys(obj)) {
    convertBase64ToUint8Array(obj[key]);
  }
  return value;
}
