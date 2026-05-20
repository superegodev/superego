import { existsSync, readdirSync, rmSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import typescriptLibs from "@superego/app-sandbox/typescript-libs";
import { appAgentsContent, appSkillContent } from "./agentFiles.js";
import { getCollectionTypescriptSource } from "./compile.js";
import { writeJson } from "./json.js";
import tsconfig from "./tsconfig.js";
import type { TargetCollection } from "./types.js";

export async function regenerateGeneratedFiles(
  path: string,
  targetCollections: TargetCollection[],
): Promise<void> {
  removeGeneratedCollectionFiles(path);
  for (const targetCollection of targetCollections) {
    await writeFile(
      join(path, `${targetCollection.id}.ts`),
      getCollectionTypescriptSource(
        targetCollection.id,
        targetCollection.version,
      ),
      "utf-8",
    );
  }
  await writeFile(join(path, "AGENTS.md"), appAgentsContent, "utf-8");
  await mkdir(join(path, ".agents", "skills", "writing-superego-apps"), {
    recursive: true,
  });
  await writeFile(
    join(path, ".agents", "skills", "writing-superego-apps", "SKILL.md"),
    appSkillContent,
    "utf-8",
  );
  await writeTypescriptLibs(path);
  await writeJson(join(path, "tsconfig.json"), tsconfig);
}

function removeGeneratedCollectionFiles(path: string): void {
  if (!existsSync(path)) {
    return;
  }
  for (const entry of readdirSync(path)) {
    if (/^Collection_.*\.ts$/.test(entry)) {
      rmSync(join(path, entry));
    }
  }
}

async function writeTypescriptLibs(path: string): Promise<void> {
  for (const typescriptLib of typescriptLibs) {
    const filePath = join(path, typescriptLib.path.slice(1));
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, typescriptLib.source, "utf-8");
  }
}
