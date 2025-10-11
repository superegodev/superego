export default async function sha256(
  message: string | Uint8Array<ArrayBuffer>,
  format: "hex",
): Promise<string>;
export default async function sha256(
  message: string | Uint8Array<ArrayBuffer>,
  format: "bytes",
): Promise<Uint8Array<ArrayBuffer>>;
export default async function sha256(
  message: string | Uint8Array<ArrayBuffer>,
  format: "hex" | "bytes",
): Promise<string | Uint8Array<ArrayBuffer>> {
  const data =
    typeof message === "string" ? new TextEncoder().encode(message) : message;
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return format === "hex"
    ? Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    : new Uint8Array(hashBuffer);
}
