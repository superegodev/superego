import { readFileSync, writeFileSync } from "node:fs";
import { $ } from "zx";

// Compile.
$.sync`tsc --project tsconfig.types.json`;

// Make declarations global.
const localInstantDtsPath = "types/LocalInstant.d.ts";
writeFileSync(
  localInstantDtsPath,
  `
    declare namespace Module {
    ${readFileSync(localInstantDtsPath, "utf8")
      .replaceAll("export default LocalInstant;", "")
      .replaceAll(/declare /g, "")}
    }

    declare global {
      namespace globalThis {
        export import LocalInstant = Module.LocalInstant;
      }
    }

    export {};
  `,
);

// Format.
$.sync`yarn workspace @superego/root fix-formatting`;
