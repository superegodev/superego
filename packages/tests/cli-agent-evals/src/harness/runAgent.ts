import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { EvalWorkspace } from "./workspace.js";
import { shellQuote } from "./workspace.js";

export interface AgentRun {
  stdout: string;
  stderr: string;
}

export async function runAgent(
  workspace: EvalWorkspace,
  prompt: string,
): Promise<AgentRun> {
  const commandTemplate = process.env["SUPEREGO_CLI_AGENT_COMMAND"];
  if (!commandTemplate) {
    throw new Error("SUPEREGO_CLI_AGENT_COMMAND is not set.");
  }

  const promptsDir = join(workspace.rootDir, "prompts");
  mkdirSync(promptsDir, { recursive: true });
  const promptFile = join(promptsDir, "prompt.md");
  writeFileSync(promptFile, prompt);

  const command = buildCommand(commandTemplate, prompt, promptFile);
  return await spawnAgent(command, prompt, workspace);
}

function buildCommand(
  commandTemplate: string,
  prompt: string,
  promptFile: string,
): string {
  return commandTemplate
    .replaceAll("{prompt}", shellQuote(prompt))
    .replaceAll("{promptFile}", shellQuote(promptFile));
}

function spawnAgent(
  command: string,
  prompt: string,
  workspace: EvalWorkspace,
): Promise<AgentRun> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, {
      cwd: workspace.workDir,
      env: workspace.env,
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr });
      } else {
        reject(
          new Error(
            [
              `Agent command failed with code ${code ?? "null"} and signal ${
                signal ?? "null"
              }.`,
              "STDOUT:",
              stdout,
              "STDERR:",
              stderr,
            ].join("\n"),
          ),
        );
      }
    });
    child.stdin.end(prompt);
  });
}
