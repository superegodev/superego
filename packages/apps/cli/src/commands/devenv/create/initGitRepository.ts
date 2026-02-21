import { execFileSync } from "node:child_process";

export default function initGitRepository(basePath: string): void {
  try {
    execFileSync("git", ["--version"], { stdio: "ignore" });
  } catch {
    return;
  }
  execFileSync("git", ["init"], { cwd: basePath, stdio: "ignore" });
  execFileSync("git", ["add", "."], { cwd: basePath, stdio: "ignore" });
  execFileSync("git", ["commit", "-m", "Initial setup"], {
    cwd: basePath,
    stdio: "ignore",
  });
}
