export default function toBase64(content: Uint8Array<ArrayBuffer>): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(content).toString("base64");
  }
  // 32KB chunks
  const CHUNK_SIZE = 0x8000;
  let binary = "";
  for (let i = 0; i < content.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(content.subarray(i, i + CHUNK_SIZE)),
    );
  }
  return btoa(binary);
}
