import { mkdtempSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export default async function importModule(
  javascriptModule: string,
): Promise<unknown> {
  const tempDir = mkdtempSync(join(tmpdir(), "superego-module-"));
  const modulePath = join(tempDir, `module-${crypto.randomUUID()}.mjs`);
  try {
    writeFileSync(modulePath, javascriptModule);
    return await import(/* @vite-ignore */ modulePath);
  } finally {
    try {
      unlinkSync(modulePath);
      rmdirSync(tempDir);
    } catch {}
  }
}
