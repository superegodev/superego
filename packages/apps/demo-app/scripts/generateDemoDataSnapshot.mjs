import { access, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer } from "vite";

const packageRoot = resolve(import.meta.dirname, "..");
const outputPath = resolve(
  packageRoot,
  "src/demoData/demoDataSnapshot.generated.json",
);

if (process.argv.includes("--if-missing")) {
  try {
    await access(outputPath);
    process.exit(0);
  } catch {
    // Continue and generate it.
  }
}

const server = await createServer({
  root: packageRoot,
  configFile: false,
  appType: "custom",
  logLevel: "warn",
  ssr: {
    noExternal: [/^@superego\//],
  },
});

try {
  const { default: generateDemoDataSnapshot } = await server.ssrLoadModule(
    "/src/demoData/generateDemoDataSnapshot.ts",
  );
  const snapshot = await generateDemoDataSnapshot();
  await writeFile(outputPath, `${snapshot}\n`, "utf-8");
} finally {
  await server.close();
}
