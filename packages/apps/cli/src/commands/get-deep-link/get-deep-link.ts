import { Id } from "@superego/shared-utils";
import { Command } from "commander";
import * as v from "valibot";
import { readArgsFile } from "../../utils/argsFile.js";
import { useMarkdownHelp } from "../../utils/markdownHelp.js";
import {
  runCommand,
  successfulResult,
  unsuccessfulResult,
} from "../../utils/results.js";
import getDeepLink, { type GetDeepLinkArgs } from "./getDeepLink.js";

const argsSchema = v.strictObject({
  resource: v.variant("type", [
    v.strictObject({
      type: v.literal("document"),
      collectionId: idSchema(Id.is.collection, "Must be a CollectionId"),
      documentId: idSchema(Id.is.document, "Must be a DocumentId"),
    }),
    v.strictObject({
      type: v.literal("documentVersion"),
      collectionId: idSchema(Id.is.collection, "Must be a CollectionId"),
      documentId: idSchema(Id.is.document, "Must be a DocumentId"),
      documentVersionId: idSchema(
        Id.is.documentVersion,
        "Must be a DocumentVersionId",
      ),
    }),
    v.strictObject({
      type: v.literal("collection"),
      collectionId: idSchema(Id.is.collection, "Must be a CollectionId"),
      appId: v.optional(idSchema(Id.is.app, "Must be an AppId")),
    }),
  ]),
});

export default useMarkdownHelp(
  new Command("get-deep-link")
    .description("Create a Superego desktop deep link for a resource.")
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

        return successfulResult({
          deepLink: getDeepLink(validationResult.output as GetDeepLinkArgs),
        });
      });
    }),
  { argsSchema },
);

function idSchema<Id extends string>(
  isId: (value: string) => value is Id,
  message: string,
) {
  return v.pipe(
    v.string(),
    v.check((value): value is Id => isId(value), message),
  );
}
