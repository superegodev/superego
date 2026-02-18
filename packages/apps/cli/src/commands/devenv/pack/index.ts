import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { encode } from "@msgpack/msgpack";
import compilePack from "../utils/compilePack.js";
import Log from "../utils/Log.js";

export default async function packAction(): Promise<void> {
  const basePath = resolve(process.cwd());

  Log.info("Compiling pack...");
  const pack = await compilePack(basePath);
  Log.info("Pack compiled successfully.");

  Log.info("Writing pack.mpk...");
  const encoded = encode(pack);
  writeFileSync(join(basePath, "pack.mpk"), encoded);
  Log.info("pack.mpk written successfully.");
}
