import type { AppId } from "@superego/backend";
import { Command } from "commander";
import * as v from "valibot";
import { ArgsFileError } from "../../../utils/argsFile.js";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import { runCommand, unsuccessfulResult } from "../../../utils/results.js";
import {
  getArgsFileJsonSchema,
  readAppsArgs,
  requireArgsFile,
} from "../common/args.js";

const argsSchema = v.strictObject({
  id: v.string(),
});

export default useMarkdownHelp(
  requireArgsFile(
    new Command("delete").description("Delete a backend app."),
  ).action(async (options: { args: string }) => {
    await runCommand(async () => {
      try {
        const args = readAppsArgs(options.args, argsSchema);
        const id = args.id as AppId;
        return (await createBackend()).apps.delete(id, "delete");
      } catch (error) {
        if (error instanceof ArgsFileError) {
          return unsuccessfulResult("ArgumentsNotValid", error.details);
        }
        throw error;
      }
    });
  }),
  { argsFileSchema: getArgsFileJsonSchema(argsSchema) },
);
