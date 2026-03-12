import { Command } from "commander";
import collectionsListAction from "./commands/collections/list.js";
import devenv from "./commands/devenv/index.js";
import documentsCreateAction from "./commands/documents/create.js";
import documentsCreateManyAction from "./commands/documents/createMany.js";
import documentsCreateNewVersionAction from "./commands/documents/createNewVersion.js";
import documentsDeleteAction from "./commands/documents/delete.js";
import documentsGetAction from "./commands/documents/get.js";
import documentsListAction from "./commands/documents/list.js";
import documentsSearchAction from "./commands/documents/search.js";
import filesGetContentAction from "./commands/files/getContent.js";
import llmTxtAction from "./commands/llm-txt/index.js";

export default function cli(options: {
  version: string;
  description: string;
}): void {
  const program = new Command()
    .name("superego")
    .version(options.version)
    .description(options.description);

  program.addCommand(devenv);

  program
    .command("llm-txt")
    .description("Print LLM-readable documentation about Superego")
    .action(llmTxtAction);

  const collections = new Command("collections").description(
    "Manage collections",
  );
  collections
    .command("list")
    .description("List all collections")
    .action(collectionsListAction);
  program.addCommand(collections);

  const documents = new Command("documents").description("Manage documents");
  documents
    .command("create")
    .description("Create a document")
    .action(documentsCreateAction);
  documents
    .command("create-many")
    .description("Create multiple documents")
    .action(documentsCreateManyAction);
  documents
    .command("create-new-version")
    .description("Create a new version of a document")
    .action(documentsCreateNewVersionAction);
  documents
    .command("delete")
    .description("Delete a document")
    .action(documentsDeleteAction);
  documents
    .command("list")
    .description("List documents in a collection")
    .action(documentsListAction);
  documents
    .command("get")
    .description("Get a document")
    .action(documentsGetAction);
  documents
    .command("search")
    .description("Search documents")
    .action(documentsSearchAction);
  program.addCommand(documents);

  const files = new Command("files").description("Manage files");
  files
    .command("get-content")
    .description("Get the binary content of a file")
    .action(filesGetContentAction);
  program.addCommand(files);

  program.parse();
}
