import { mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import typescriptLibs from "@superego/app-sandbox/typescript-libs";
import { codegen } from "@superego/schema";
import Log from "../shared/log.js";
import agentsMd from "./agent-instructions/AGENTS.md?raw";
import writingAppsMd from "./agent-instructions/writing-apps.md?raw";
import writingCollectionSchemasMd from "./agent-instructions/writing-collection-schemas.md?raw";
import writingContentBlockingKeysGettersMd from "./agent-instructions/writing-content-blocking-keys-getters.md?raw";
import writingContentSummaryGettersMd from "./agent-instructions/writing-content-summary-getters.md?raw";
import writingDefaultDocumentViewUiOptionsMd from "./agent-instructions/writing-default-document-view-ui-options.md?raw";
import {
  appMainTsxStub,
  appSettingsStub,
  collectionSchemaStub,
  collectionSettingsStub,
  getContentSummaryGetterStub,
} from "./stubs.js";
import getTsconfigJson from "./tsconfig.js";

function writeFile(
  filePath: string,
  content: string,
  options?: { readonly?: boolean },
) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, {
    mode: options?.readonly ? 0o444 : undefined,
  });
}

function writeJsonFile(
  filePath: string,
  data: unknown,
  options?: { readonly?: boolean },
) {
  writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, options);
}

export default async function createAction(targetPath: string): Promise<void> {
  const basePath = resolve(targetPath);

  // 1. Write typescript-libs (readonly)
  for (const lib of typescriptLibs) {
    writeFile(join(basePath, lib.path), lib.source, { readonly: true });
  }

  // 2. Write tsconfig.json (readonly)
  writeJsonFile(join(basePath, "tsconfig.json"), getTsconfigJson(), {
    readonly: true,
  });

  // 3. Write agent instruction files
  const agentFiles: { path: string; content: string }[] = [
    { path: "AGENTS.md", content: agentsMd },
    {
      path: ".agents/skills/writing-collection-schemas/SKILL.md",
      content: writingCollectionSchemasMd,
    },
    {
      path: ".agents/skills/writing-content-summary-getters/SKILL.md",
      content: writingContentSummaryGettersMd,
    },
    {
      path: ".agents/skills/writing-content-blocking-keys-getters/SKILL.md",
      content: writingContentBlockingKeysGettersMd,
    },
    {
      path: ".agents/skills/writing-default-document-view-ui-options/SKILL.md",
      content: writingDefaultDocumentViewUiOptionsMd,
    },
    {
      path: ".agents/skills/writing-apps/SKILL.md",
      content: writingAppsMd,
    },
  ];
  for (const { path, content } of agentFiles) {
    writeFile(join(basePath, path), content);
  }

  // 4. CLAUDE.md symlink -> AGENTS.md
  symlinkSync("AGENTS.md", join(basePath, "CLAUDE.md"));

  // 5. Write collection stub (ProtoCollection_0/)
  const collectionDir = join(basePath, "ProtoCollection_0");
  writeJsonFile(join(collectionDir, "settings.json"), collectionSettingsStub);
  writeJsonFile(join(collectionDir, "schema.json"), collectionSchemaStub);
  writeFile(
    join(collectionDir, "contentSummaryGetter.ts"),
    `${getContentSummaryGetterStub(
      "ProtoCollection_0",
      collectionSchemaStub.rootType,
    )}\n`,
  );

  // 6. Write app stub (ProtoApp_0/)
  const appDir = join(basePath, "ProtoApp_0");
  writeJsonFile(join(appDir, "settings.json"), appSettingsStub);
  writeFile(join(appDir, "main.tsx"), appMainTsxStub);

  // 7. Generate types for the stub schema
  const generatedTypes = codegen(collectionSchemaStub);
  writeFile(
    join(basePath, "generated", "ProtoCollection_0.ts"),
    generatedTypes,
  );

  Log.info(`Development environment created at ${basePath}`);
}
