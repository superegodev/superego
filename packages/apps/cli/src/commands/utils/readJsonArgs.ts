export default async function readJsonArgs(): Promise<unknown[]> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (raw === "") {
    return [];
  }

  return JSON.parse(raw) as unknown[];
}
