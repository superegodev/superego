import { mkdtempSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TypescriptModule } from "@superego/backend";

export default async function importModule(
  typescriptModule: TypescriptModule,
): Promise<unknown> {
  const tempDir = mkdtempSync(join(tmpdir(), "superego-module-"));
  const modulePath = join(tempDir, `module-${crypto.randomUUID()}.mjs`);
  try {
    writeFileSync(modulePath, typescriptModule.compiled);
    return await import(/* @vite-ignore */ modulePath);
  } finally {
    try {
      unlinkSync(modulePath);
      rmdirSync(tempDir);
    } catch {}
  }
}
