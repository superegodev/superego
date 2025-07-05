import * as v from "valibot";
import type { FileTypeDefinition } from "../../../typeDefinitions.js";
import type FileRef from "../../../types/FileRef.js";
import type ProtoFile from "../../../types/ProtoFile.js";
import translate from "../../../utils/translate.js";

/**
 * File check that ensures that the file matches the `accept` constraint defined
 * in the schema. If there is no accept constraint, the check always passes.
 */
export default function satisfiesAccept(
  accept?: FileTypeDefinition["accept"] | undefined,
) {
  return v.check(
    ({ name, mimeType }: FileRef | ProtoFile) => {
      if (!accept) {
        return true;
      }
      return Object.entries(accept).some(
        ([mimeTypeMatcher, acceptedFileExtensions]) =>
          mimeTypeMatches(mimeType, mimeTypeMatcher) &&
          hasAcceptedFileExtension(name, acceptedFileExtensions),
      );
    },
    ({ lang }) =>
      translate(lang, {
        en: 'Invalid file: Does not satisfy "accept" constraint',
      }),
  );
}

function mimeTypeMatches(mimeType: string, matcher: string): boolean {
  const [typeMatcher, subtypeMatcher] = matcher.toLowerCase().split("/");
  const [type, subtype] = mimeType.toLowerCase().split("/");
  if (typeMatcher === "*") {
    return subtypeMatcher === "*" || subtype === subtypeMatcher;
  }
  if (type !== typeMatcher) {
    return false;
  }
  return subtypeMatcher === "*" || subtype === subtypeMatcher;
}

function hasAcceptedFileExtension(
  fileName: string,
  acceptedFileExtensions: "*" | string[],
) {
  if (acceptedFileExtensions === "*") {
    return true;
  }
  return acceptedFileExtensions.some((acceptedFileExtension) =>
    fileName.toLowerCase().endsWith(acceptedFileExtension.toLowerCase()),
  );
}
