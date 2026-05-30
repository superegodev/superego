import { writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import type { FileId } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { Command } from "commander";
import * as v from "valibot";
import { readArgsFile } from "../../../utils/argsFile.js";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import {
  runCommand,
  successfulResult,
  unsuccessfulResult,
} from "../../../utils/results.js";

type FilesGetContentArgs = {
  id: FileId;
  outputPath?: string;
};

const argsSchema = v.strictObject({
  id: getFileIdSchema(),
  outputPath: v.optional(v.pipe(v.string(), v.minLength(1))),
});

export default useMarkdownHelp(
  new Command("get-content")
    .description("Get file content.")
    .requiredOption("--args <file>", "Path to JSON args file.")
    .action(async (options: { args: string }) => {
      await runCommand(async () => {
        const argsFileResult = readArgsFile(options.args);
        if (!argsFileResult.success) {
          return argsFileResult;
        }

        const validationResult = v.safeParse(argsSchema, argsFileResult.data);
        if (!validationResult.success) {
          return unsuccessfulResult("ArgumentsNotValid", {
            issues: validationResult.issues,
          });
        }

        const args: FilesGetContentArgs = validationResult.output;
        const result = await (await createBackend()).files.getContent(args.id);
        if (!result.success || !args.outputPath) {
          return result;
        }

        const absoluteOutputPath = isAbsolute(args.outputPath)
          ? args.outputPath
          : resolve(dirname(resolve(options.args)), args.outputPath);
        try {
          writeFileSync(absoluteOutputPath, result.data);
        } catch (error) {
          return unsuccessfulResult("OutputPathNotWritable", {
            outputPath: absoluteOutputPath,
            cause: error instanceof Error ? error.message : String(error),
          });
        }
        return successfulResult({
          id: args.id,
          outputPath: args.outputPath,
          bytesWritten: result.data.byteLength,
        });
      });
    }),
  { argsSchema },
);

function getFileIdSchema(): v.GenericSchema<unknown, FileId> {
  return v.custom<FileId>(Id.is.file);
}
