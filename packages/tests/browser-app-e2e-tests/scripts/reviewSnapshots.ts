import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";

const scenariosDir = resolve(import.meta.dirname, "../src/scenarios");
const htmlPath = resolve(import.meta.dirname, "reviewSnapshots.html");
const port = 3847;

// --- Data loading ---

interface Step {
  id: string;
  title: string;
  requirement: string;
  snapshotFile: string;
  snapshotHash: string;
  existingResult?: string;
}

interface Test {
  id: string;
  title: string;
  snapshotsDir: string;
  steps: Step[];
}

function hashFile(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
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

    const allSnapshotFiles = existsSync(snapshotsDirPath)
      ? readdirSync(snapshotsDirPath)
      : [];

    const steps: Step[] = stepTitles.map((stepTitle, i) => {
      const stepId = String(i).padStart(2, "0");
      const requirementFile = join(snapshotsDirPath, `${stepId}.txt`);
      const requirement = existsSync(requirementFile)
        ? readFileSync(requirementFile, "utf-8")
        : "(requirement not found — run tests first)";
      const snapshotFile =
        allSnapshotFiles.find(
          (s) => s.startsWith(`${stepId}-`) && s.endsWith(".png"),
        ) ?? `${stepId}.png`;

      const snapshotPath = join(snapshotsDirPath, snapshotFile);
      const snapshotHash = existsSync(snapshotPath)
        ? hashFile(snapshotPath)
        : "";

      // Check for existing review
      let existingResult: string | undefined;
      const reviewFile = join(snapshotsDirPath, `${stepId}.review`);
      if (existsSync(reviewFile)) {
        const review = JSON.parse(readFileSync(reviewFile, "utf-8")) as {
          result: string;
          snapshotHash: string;
        };
        if (review.snapshotHash === snapshotHash) {
          existingResult = review.result;
        } else {
          unlinkSync(reviewFile);
        }
      }

      return {
        id: stepId,
        title: stepTitle,
        requirement,
        snapshotFile,
        snapshotHash,
        existingResult,
      };
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

      // Write per-step .review files
      for (const [key, result] of Object.entries(results)) {
        const [testId, stepId] = key.split("/");
        const test = tests.find((t) => t.id === testId);
        const step = test?.steps.find((s) => s.id === stepId);
        if (test && step) {
          const reviewFile = join(
            scenariosDir,
            test.snapshotsDir,
            `${stepId}.review`,
          );
          writeFileSync(
            reviewFile,
            JSON.stringify({ result, snapshotHash: step.snapshotHash }),
          );
        }
      }

      // Print report
      const hasFails = Object.values(results).some((v) => v === "fail");
      console.log("\n=== Review Report ===\n");
      for (const test of tests) {
        console.log(`${test.title}:`);
        for (const step of test.steps) {
          const result = results[`${test.id}/${step.id}`] ?? "not reviewed";
          const icon =
            result === "pass" ? "✓" : result === "fail" ? "✗" : "?";
          console.log(`  ${icon} ${step.title}: ${result}`);
        }
      }
      console.log(
        hasFails
          ? "\nFAIL: Some steps failed review"
          : "\nPASS: All steps passed review",
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));

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
