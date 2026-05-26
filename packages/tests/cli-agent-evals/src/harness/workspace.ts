import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface EvalWorkspace {
  rootDir: string;
  workDir: string;
  binDir: string;
  databaseDir: string;
  databaseFile: string;
  env: NodeJS.ProcessEnv;
}

export function createEvalWorkspace(): EvalWorkspace {
  const rootDir = mkdtempSync(join(tmpdir(), "superego-cli-agent-evals-"));
  const workDir = join(rootDir, "work");
  const binDir = join(rootDir, "bin");
  const databaseDir = join(rootDir, "db");
  const databaseFile = join(databaseDir, "superego.sqlite");
  mkdirSync(workDir, { recursive: true });
  mkdirSync(binDir, { recursive: true });
  mkdirSync(databaseDir, { recursive: true });
  writeSafeSuperegoWrapper(binDir, databaseDir);
  return {
    rootDir,
    workDir,
    binDir,
    databaseDir,
    databaseFile,
    env: {
      ...process.env,
      PATH: `${binDir}${delimiter}${process.env["PATH"] ?? ""}`,
      SUPEREGO_DATABASE_FILE: databaseFile,
    },
  };
}

function writeSafeSuperegoWrapper(binDir: string, databaseDir: string): void {
  const wrapperPath = join(binDir, "superego");
  const cliBin = resolve(
    process.env["SUPEREGO_CLI_BIN"] ?? defaultCliBinPath(),
  );
  const script = [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    `allowed_dir=${shellQuote(databaseDir)}`,
    `real_cli=${shellQuote(cliBin)}`,
    'if [[ -z "$' + '{SUPEREGO_DATABASE_FILE:-}" ]]; then',
    '  echo "SUPEREGO_DATABASE_FILE must be set for CLI agent evals." >&2',
    "  exit 42",
    "fi",
    'case "$SUPEREGO_DATABASE_FILE" in',
    '  "$allowed_dir"/*) ;;',
    "  *)",
    '    echo "Refusing to run superego outside eval database dir: $SUPEREGO_DATABASE_FILE" >&2',
    "    exit 43",
    "    ;;",
    "esac",
    'if [[ ! -x "$real_cli" ]]; then',
    '  echo "Superego CLI binary is missing or not executable: $real_cli" >&2',
    '  echo "Run: yarn workspace @superego/electron-app build:cli" >&2',
    "  exit 44",
    "fi",
    'exec "$real_cli" "$@"',
    "",
  ].join("\n");
  writeFileSync(wrapperPath, script);
  chmodSync(wrapperPath, 0o755);
}

function defaultCliBinPath(): string {
  const thisFile = fileURLToPath(import.meta.url);
  const packageRoot = resolve(dirname(thisFile), "..", "..");
  const repoRoot = resolve(packageRoot, "..", "..", "..");
  const cliBin = join(
    repoRoot,
    "packages",
    "apps",
    "electron-app",
    "dist",
    "cli",
    "superego.js",
  );
  if (existsSync(cliBin)) {
    return cliBin;
  }
  return relative(process.cwd(), cliBin);
}

export function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
