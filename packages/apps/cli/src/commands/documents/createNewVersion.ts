import type {
  CollectionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import * as v from "valibot";
import convertBase64ToUint8Array from "../utils/convertBase64ToUint8Array.js";
import createBackend from "../utils/createBackend.js";
import readJsonArgs from "../utils/readJsonArgs.js";

const argsSchema = v.tuple([v.string(), v.string(), v.string(), v.any()]);

export default async function documentsCreateNewVersionAction(): Promise<void> {
  const args = await readJsonArgs();
  const [collectionId, id, latestVersionId, content] = v.parse(
    argsSchema,
    args,
  );

  convertBase64ToUint8Array(content);

  const backend = createBackend();
  const result = await backend.documents.createNewVersion(
    collectionId as CollectionId,
    id as DocumentId,
    latestVersionId as DocumentVersionId,
    content,
  );

  process.stdout.write(JSON.stringify(result));
}
