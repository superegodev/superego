import { symlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import typescriptLibs from "@superego/app-sandbox/typescript-libs";
import { codegen } from "@superego/schema";
import Log from "../utils/Log.js";
import writeFile from "../utils/writeFile.js";
import writeJsonFile from "../utils/writeJsonFile.js";
import agentFiles from "./agent-files.js";
import initGitRepository from "./initGitRepository.js";
import {
  appMainTsxStub,
  appSettingsStub,
  collectionSchemaStub,
  collectionSettingsStub,
  contentBlockingKeysGetterStub,
  contentSummaryGetterStub,
  demoDocumentStub,
  packJsonStub,
} from "./stubs.js";
import tsconfig from "./tsconfig.js";

export default async function createAction(targetPath: string): Promise<void> {
  const basePath = resolve(targetPath);

  // 1. typescript-libs
  for (const lib of typescriptLibs) {
    writeFile(join(basePath, lib.path), lib.source, { readonly: true });
  }

  // 2. tsconfig.json
  writeJsonFile(join(basePath, "tsconfig.json"), tsconfig, {
    readonly: true,
  });

  // 3. Agent instruction files
  for (const { path, content } of agentFiles) {
    writeFile(join(basePath, path), content);
  }

  // 4. CLAUDE.md symlink -> AGENTS.md
  symlinkSync("AGENTS.md", join(basePath, "CLAUDE.md"));

  // 5. pack.json
  writeJsonFile(join(basePath, "pack.json"), packJsonStub);

  // 6. Collection stub (ProtoCollection_0/)
  const collectionDir = join(basePath, "ProtoCollection_0");
  writeJsonFile(join(collectionDir, "settings.json"), collectionSettingsStub);
  writeJsonFile(join(collectionDir, "schema.json"), collectionSchemaStub);
  writeFile(
    join(collectionDir, "contentSummaryGetter.ts"),
    contentSummaryGetterStub,
    { trailingNewline: true },
  );
  writeFile(
    join(collectionDir, "contentBlockingKeysGetter.ts"),
    contentBlockingKeysGetterStub,
    { trailingNewline: true },
  );

  // 7. App stub (ProtoApp_0/)
  const appDir = join(basePath, "ProtoApp_0");
  writeJsonFile(join(appDir, "settings.json"), appSettingsStub);
  writeFile(join(appDir, "main.tsx"), appMainTsxStub, {
    trailingNewline: true,
  });

  // 8. Demo document stub (demo-documents/ProtoDocument_0.json)
  writeJsonFile(
    join(basePath, "demo-documents", "ProtoDocument_0.json"),
    demoDocumentStub,
  );

  // 9. Generate types for the stub schema
  const generatedTypes = codegen(collectionSchemaStub);
  writeFile(
    join(basePath, "generated", "ProtoCollection_0.ts"),
    generatedTypes,
  );

  // 10. Initialize git repository
  initGitRepository(basePath);

  Log.info(`Development environment created at ${basePath}`);
}
