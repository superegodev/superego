import { CollectionRouteView, RouteName, toDeepLink } from "@superego/routing";
import { valibotSchemas } from "@superego/shared-utils";
import { Command } from "commander";
import * as v from "valibot";
import { readArgsFile } from "../../utils/argsFile.js";
import { useMarkdownHelp } from "../../utils/markdownHelp.js";
import {
  runCommand,
  successfulResult,
  unsuccessfulResult,
} from "../../utils/results.js";

const argsSchema = v.strictObject({
  resource: v.variant("type", [
    v.strictObject({
      type: v.literal("document"),
      collectionId: valibotSchemas.id.collection(),
      documentId: valibotSchemas.id.document(),
    }),
    v.strictObject({
      type: v.literal("documentVersion"),
      collectionId: valibotSchemas.id.collection(),
      documentId: valibotSchemas.id.document(),
      documentVersionId: valibotSchemas.id.documentVersion(),
    }),
    v.strictObject({
      type: v.literal("collection"),
      collectionId: valibotSchemas.id.collection(),
      appId: v.optional(valibotSchemas.id.app()),
    }),
  ]),
});
type GetDeepLinkArgs = v.InferOutput<typeof argsSchema>;

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
          deepLink: getDeepLink(validationResult.output),
        });
      });
    }),
  { argsSchema },
);

function getDeepLink({ resource }: GetDeepLinkArgs): string {
  switch (resource.type) {
    case "document":
      return toDeepLink({
        name: RouteName.Document,
        collectionId: resource.collectionId,
        documentId: resource.documentId,
      });
    case "documentVersion":
      return toDeepLink({
        name: RouteName.Document,
        collectionId: resource.collectionId,
        documentId: resource.documentId,
        documentVersionId: resource.documentVersionId,
      });
    case "collection":
      return toDeepLink(
        resource.appId
          ? {
              name: RouteName.Collection,
              collectionId: resource.collectionId,
              view: CollectionRouteView.App,
              appId: resource.appId,
            }
          : {
              name: RouteName.Collection,
              collectionId: resource.collectionId,
            },
      );
  }
}
