import startCliProcess from "./startCliProcess.js";

const cliArgs = getCliArgs();

if (cliArgs) {
  void startCliProcess(cliArgs);
} else {
  const { default: startElectronProcess } =
    await import("./startElectronProcess.js");
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
