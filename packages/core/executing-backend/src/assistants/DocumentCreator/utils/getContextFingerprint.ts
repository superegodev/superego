import type { Collection } from "@superego/backend";
import sha256 from "../../../utils/sha256.js";

export default async function getContextFingerprint(
  collections: Collection[],
): Promise<string> {
  return sha256(
    collections.map((collection) => collection.latestVersion.id).join(""),
  );
}
