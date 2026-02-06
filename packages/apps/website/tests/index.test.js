import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("landing page copy and links are present", async () => {
  // Setup SUT
  const indexPath = path.join(__dirname, "../src/pages/index.astro");

  // Exercise
  const contents = await readFile(indexPath, "utf8");

  // Verify
  assert.match(contents, /# What/);
  assert.match(contents, /# Why/);
  assert.match(contents, /PUBLIC_DISCORD_INVITE_URL/);
  assert.match(contents, /stars/);
  assert.doesNotMatch(contents, /\$n stars/);
});
