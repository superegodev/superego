import monaco from "../../../../monaco.js";
import isEmpty from "../../../../utils/isEmpty.js";

/** Gets the compiled output of the supplied source file. */
export default async function getCompilationOutput(
  sourcePath: string,
  failedCompilationOutput: string,
): Promise<string> {
  try {
    const worker = await monaco.typescript
      .getTypeScriptWorker()
      .catch((error) => {
        // Sometimes the first call to `getTypeScriptWorker` fails with the
        // error below (actually string, not an Error object). It's not clear
        // why. The second attempt seems to work, so here we retry once.
        if (error === "TypeScript not registered!") {
          return monaco.typescript.getTypeScriptWorker();
        }
        throw error;
      })
      .then((getter) => getter());

    const emitOutput = await worker.getEmitOutput(sourcePath);
    const diagnostics = (
      await Promise.all([
        worker.getSyntacticDiagnostics(sourcePath),
        worker.getSemanticDiagnostics(sourcePath),
        emitOutput.diagnostics ?? [],
      ])
    ).flat();

    const compiledPath = sourcePath.replace(/\.tsx?$/, ".js");
    const compiled = emitOutput.outputFiles.find(
      ({ name }) => name === compiledPath,
    )?.text;

    return isEmpty(diagnostics) && compiled
      ? compiled
      : failedCompilationOutput;
  } catch (error) {
    // When the editor is disposed before compilation is finished, an error
    // matching this condition is thrown. Since it's a know, expected condition,
    // we don't log anything. (Of course the compilation still needs to be
    // marked as failed.)
    if (
      !(
        error instanceof Error &&
        error.message.includes("Could not find source file")
      )
    ) {
      console.error("Error compiling TypescriptModule:", error);
    }
    return failedCompilationOutput;
  }
}
