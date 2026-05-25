import { cli } from "@superego/cli";
import pkg from "../../package.json" with { type: "json" };

const cliArgs = getCliArgs();

if (cliArgs) {
  void startCliProcess(cliArgs);
} else {
  const { default: startElectronProcess } =
    await import("./electronProcess.js");
  startElectronProcess();
}

function getCliArgs(): string[] | null {
  const separatorIndex = process.argv.findIndex(
    (argument) => argument === "--cli",
  );
  if (separatorIndex === -1) {
    return null;
  }
  return process.argv.slice(separatorIndex + 1);
}

async function startCliProcess(cliArgs: string[]): Promise<void> {
  const argv = [process.argv[0] ?? "superego-app", "superego", ...cliArgs];

  try {
    await cli({ version: pkg.version, argv });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    const exitCode =
      process.exitCode === undefined ? 0 : Number(process.exitCode);
    process.exit(Number.isFinite(exitCode) ? exitCode : 1);
  }
}
