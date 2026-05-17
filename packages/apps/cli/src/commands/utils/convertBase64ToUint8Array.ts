const BASE64_PATTERN = /^data:([^;]+);base64,(.+)$/;

export default function convertBase64ToUint8Array(content: unknown): void {
  if (content === null || typeof content !== "object") {
    return;
  }

  for (const [key, value] of Object.entries(content)) {
    if (typeof value === "string") {
      const match = BASE64_PATTERN.exec(value);
      if (match !== null) {
        const mimeType = match[1];
        const data = match[2];
        if (mimeType === undefined || data === undefined) {
          continue;
        }
        const buffer = Buffer.from(data, "base64");
        (content as Record<string, unknown>)[key] = {
          mimeType,
          bytes: new Uint8Array(buffer),
        };
      }
      continue;
    }

    convertBase64ToUint8Array(value);
  }
}
