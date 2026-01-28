import * as v from "valibot";
import type { FileTypeDefinition } from "../../typeDefinitions.js";
import type FileRef from "../../types/FileRef.js";
import type ProtoFile from "../../types/ProtoFile.js";
import type RHFProtoFile from "../../types/RHFProtoFile.js";
import translate from "../../utils/translate.js";
import mimeType from "../mimeType/mimeType.js";
import satisfiesAccept from "./checks/satisfiesAccept.js";

export default function file(
  accept: FileTypeDefinition["accept"] | undefined,
  variant: "normal" | "rhf",
): v.GenericSchema<
  FileRef | ProtoFile | RHFProtoFile,
  FileRef | ProtoFile | RHFProtoFile
> {
  return v.pipe(
    // Added any type check to make the pipeline types work.
    v.any(),
    v.looseObject({ name: v.string(), mimeType: mimeType() }),
    v.union([fileRef(), protoFile(variant)], ({ lang }) =>
      translate(lang, {
        en: "Invalid file: neither a FileRef nor a ProtoFile",
      }),
    ),
    satisfiesAccept(accept),
  );
}

function fileRef(): v.GenericSchema<FileRef, FileRef> {
  return v.strictObject({
    id: v.string(),
    name: v.string(),
    mimeType: v.string(),
  });
}

function protoFile(
  variant: "normal" | "rhf",
): v.GenericSchema<ProtoFile | RHFProtoFile, ProtoFile | RHFProtoFile> {
  return variant === "normal"
    ? v.strictObject({
        name: v.string(),
        mimeType: v.string(),
        content: v.instance(Uint8Array),
      })
    : v.strictObject({
        name: v.string(),
        mimeType: v.string(),
        content: v.instance(File),
      });
}
