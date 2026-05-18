import { readFile } from "node:fs/promises";

export async function readJsonInput(
  path: string | undefined,
): Promise<unknown> {
  if (path === "-") {
    return parseJson(await readStdin(), "stdin");
  }
  if (path) {
    return parseJson(await readFile(path, "utf-8"), path);
  }
  if (!process.stdin.isTTY) {
    return parseJson(await readStdin(), "stdin");
  }
  throw new Error("Missing JSON input. Pass --input <path|->.");
}

export function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, jsonReplacer, 2)}\n`);
}

function parseJson(source: string, target: string): unknown {
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(
      `Invalid JSON input from ${target}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function jsonReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Uint8Array) {
    return {
      type: "Uint8Array",
      base64: Buffer.from(value).toString("base64"),
    };
  }
  return value;
}
