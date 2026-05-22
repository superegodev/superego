import { Command } from "commander";
import { useMarkdownHelp } from "../../utils/markdownHelp.js";
import createMany from "./create-many/create-many.js";
import createNewVersion from "./create-new-version/create-new-version.js";
import create from "./create/create.js";
import deleteCommand from "./delete/delete.js";
import getTypescriptSchema from "./get-typescript-schema/get-typescript-schema.js";
import list from "./list/list.js";
import updateLatestVersionSettings from "./update-latest-version-settings/update-latest-version-settings.js";
import updateSettings from "./update-settings/update-settings.js";

export default useMarkdownHelp(
  new Command("collections")
    .description("Manage collection schemas, settings, and versions")
    .addCommand(create)
    .addCommand(createMany)
    .addCommand(updateSettings)
    .addCommand(createNewVersion)
    .addCommand(updateLatestVersionSettings)
    .addCommand(deleteCommand)
    .addCommand(list)
    .addCommand(getTypescriptSchema),
);
