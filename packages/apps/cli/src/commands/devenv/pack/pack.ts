import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { encode } from "@msgpack/msgpack";
import { Command } from "commander";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import compilePack from "../common/compilePack.js";
import Log from "../common/Log.js";

export default useMarkdownHelp(
  new Command("pack")
    .description("Compile the development environment into a pack.mpk file")
    .action(async () => {
      const basePath = process.cwd();

      Log.info("Compiling pack...");
      const pack = await compilePack(basePath);
      Log.info("Pack compiled successfully.");

      Log.info("Writing pack.mpk...");
      const encoded = encode(pack);
      writeFileSync(join(basePath, "pack.mpk"), encoded);
      Log.info("pack.mpk written successfully.");
    }),
);
