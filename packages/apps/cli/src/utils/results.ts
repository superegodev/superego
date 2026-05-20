import { printJson } from "./json.js";

export interface LocalResult<Data = unknown> {
  success: boolean;
  data: Data | null;
  error: { name: string; details: unknown } | null;
}

export function successfulResult<Data>(data: Data): LocalResult<Data> {
  return { success: true, data, error: null };
}

export function unsuccessfulResult(
  name: string,
  details: unknown,
): LocalResult<never> {
  return { success: false, data: null, error: { name, details } };
}

export async function runCommand(
  run: () => Promise<{ success: boolean } | LocalResult>,
): Promise<void> {
  try {
    const result = await run();
    printJson(result);
    if (!result.success) {
      process.exitCode = 1;
    }
  } catch (error) {
    printJson(
      unsuccessfulResult("UnexpectedError", {
        cause: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exitCode = 1;
  }
}
