import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";

const scenariosDir = resolve(import.meta.dirname, "../src/scenarios");
const htmlPath = resolve(import.meta.dirname, "reviewSnapshots.html");
const resultsPath = resolve(import.meta.dirname, "../review-results.json");
const port = 3847;

// --- Data loading ---

interface Step {
  id: string;
  title: string;
  requirement: string;
  snapshotFile: string;
}

interface Test {
  id: string;
  title: string;
  snapshotsDir: string;
  steps: Step[];
}

function loadTests(): Test[] {
  const entries = readdirSync(scenariosDir);
  const testFiles = entries.filter((e) => e.endsWith(".test.ts")).sort();

  return testFiles.map((fileName) => {
    const content = readFileSync(join(scenariosDir, fileName), "utf-8");
    const testMatch = content.match(/test\("([^"]+)"/);
    const title = testMatch?.[1] ?? fileName;
    const id = fileName.replace(".test.ts", "");
    const snapshotsDirName = `${fileName}-snapshots`;
    const snapshotsDirPath = join(scenariosDir, snapshotsDirName);

    const stepTitles: string[] = [
      ...content.matchAll(/test\.step\("([^"]+)"/g),
    ].map((m) => m[1]!);

    const snapshotFiles = existsSync(snapshotsDirPath)
      ? readdirSync(snapshotsDirPath)
      : [];

    const steps: Step[] = stepTitles.map((stepTitle, i) => {
      const stepId = String(i).padStart(2, "0");
      const requirementFile = join(snapshotsDirPath, `${stepId}.txt`);
      const requirement = existsSync(requirementFile)
        ? readFileSync(requirementFile, "utf-8")
        : "(requirement not found — run tests first)";
      const snapshotFile =
        snapshotFiles.find(
          (s) => s.startsWith(`${stepId}-`) && s.endsWith(".png"),
        ) ?? `${stepId}.png`;
      return { id: stepId, title: stepTitle, requirement, snapshotFile };
    });

    return { id, title, snapshotsDir: snapshotsDirName, steps };
  });
}

const tests = loadTests();

// --- Server ---

const mimeTypes: Record<string, string> = {
  ".html": "text/html",
  ".png": "image/png",
  ".json": "application/json",
};

const server = createServer((req, res) => {
  const url = new URL(req.url!, `http://localhost:${port}`);

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(readFileSync(htmlPath, "utf-8"));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/tests") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(tests));
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/snapshots/")) {
    const relative = url.pathname.slice("/snapshots/".length);
    const filePath = join(scenariosDir, relative);
    if (existsSync(filePath)) {
      const ext = extname(filePath);
      res.writeHead(200, {
        "Content-Type": mimeTypes[ext] ?? "application/octet-stream",
      });
      res.end(readFileSync(filePath));
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/submit") {
    let body = "";
    req.on("data", (chunk: string) => (body += chunk));
    req.on("end", () => {
      const results = JSON.parse(body) as Record<string, string>;
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      const hasFails = Object.values(results).some((v) => v === "fail");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));

      console.log(`Review results saved to ${resultsPath}`);
      console.log(
        hasFails
          ? "FAIL: Some steps failed review"
          : "PASS: All steps passed review",
      );

      setTimeout(() => process.exit(hasFails ? 1 : 0), 100);
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`Review app running at ${url}`);
  try {
    const open =
      process.platform === "darwin"
        ? "open"
        : process.platform === "win32"
          ? "start"
          : "xdg-open";
    execSync(`${open} ${url}`);
  } catch {
    // Ignore if browser cannot be opened.
  }
});
