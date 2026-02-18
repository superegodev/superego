import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// These global variables are required by the typescript compiler.
//
// Note: the value of __filename and __dirname usually depends on the file which
// accesses them. Since the CLI is bundled in a single file, though, it's OK to
// set them to a static value.
globalThis.__filename = fileURLToPath(import.meta.url);
globalThis.__dirname = dirname(globalThis.__filename);
globalThis.require = createRequire(import.meta.url);
