import type { FileId } from "@superego/backend";
import * as v from "valibot";
import createBackend from "../utils/createBackend.js";
import readJsonArgs from "../utils/readJsonArgs.js";

const argsSchema = v.tuple([v.string()]);

export default async function filesGetContentAction(): Promise<void> {
  const args = await readJsonArgs();
  const [id] = v.parse(argsSchema, args);

  const backend = createBackend();
  const result = await backend.files.getContent(id as FileId);

  if (result.success) {
    process.stdout.write(Buffer.from(result.data));
  } else {
    process.stdout.write(JSON.stringify(result));
  }
}
