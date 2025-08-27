import type { Collection } from "@superego/backend";
import sha256 from "./sha256.js";

export default async function getConversationContextFingerprint(
  collections: Collection[],
): Promise<string> {
  return sha256(
    collections.map((collection) => collection.latestVersion.id).join(""),
  );
}
