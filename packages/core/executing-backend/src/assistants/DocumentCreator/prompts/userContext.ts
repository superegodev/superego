import type { Collection } from "@superego/backend";
import { DateTime } from "luxon";

export default function userContext(collections: Collection[]): string {
  return [
    "<collections>",
    JSON.stringify(
      collections.map((collection) => ({
        id: collection.id,
        name: collection.settings.name,
        description: "",
        assistantInstructions: "",
        // TODO:
        // description: collection.settings.description,
        // assistantInstructions: collection.settings.assistantInstructions
      })),
    ),
    "</collections>",
    "",
    "<local-current-date-time>",
    DateTime.now().toFormat("cccc LLLL d yyyy HH:mm:ss.SSS 'GMT'ZZZ"),
    "</local-current-date-time>",
  ].join("\n");
}
