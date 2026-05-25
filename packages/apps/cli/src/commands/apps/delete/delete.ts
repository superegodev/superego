import type { AppId } from "@superego/backend";
import { Command } from "commander";
import { ArgsFileError } from "../../../utils/argsFile.js";
import createBackend from "../../../utils/createBackend.js";
import { useMarkdownHelp } from "../../../utils/markdownHelp.js";
import { runCommand, unsuccessfulResult } from "../../../utils/results.js";
import {
  getRequiredStringArg,
  readAppsArgs,
  requireArgsFile,
} from "../common/args.js";

export default useMarkdownHelp(
  requireArgsFile(
    new Command("delete").description("Delete a backend app."),
  ).action(async (options: { args: string }) => {
    await runCommand(async () => {
      try {
        const args = readAppsArgs(options.args, ["id"]);
        const id = getRequiredStringArg(args, "id") as AppId;
        return (await createBackend()).apps.delete(id, "delete");
      } catch (error) {
        if (error instanceof ArgsFileError) {
          return unsuccessfulResult("ArgumentsNotValid", error.details);
        }
        throw error;
      }
    });
  }),
);
