import * as v from "valibot";
import type DocumentRef from "../../types/DocumentRef.js";
import translate from "../../utils/translate.js";

export default function documentRef(
  collectionId?: string,
): v.GenericSchema<DocumentRef, DocumentRef> {
  return v.pipe(
    v.strictObject({
      collectionId: v.string(),
      documentId: v.string(),
    }),
    v.check(
      (documentRef: DocumentRef) =>
        collectionId === undefined || collectionId === documentRef.collectionId,
      ({ lang }) =>
        translate(lang, {
          en: `Invalid DocumentRef: collectionId must be "${collectionId}"`,
        }),
    ),
  );
}
