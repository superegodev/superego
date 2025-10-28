/////////////////////////////
// Superego built-in types //
/////////////////////////////

export type JsonObject = {
  __dataType: "JsonObject";
  [key: string]: any;
};

//////////////////
// Schema types //
//////////////////

/** My pets. */
export type Pet = 
  /** Cat. */
  | "Galois"
  /** Dog. */
  | "Abel";

/**
 * A visit to the vet.
 *
 * Note: This is the root type of this schema.
 */
export type VetVisit = {
  /** Which pet was brought. */
  pet: Pet;
  /**
   * Date of the visit.
   *
   * #### Format `dev.superego:String.PlainDate`
   *
   * A calendar date in the ISO 8601 format, with no time and no UTC offset.
   *
   * Format examples:
   * - "2006-08-24"
   * - "2024-02-29"
   */
  date: string;
  /** Short title for the visit. 5 words max. */
  title: string;
  /** Which vet the pet was brought to. */
  vet: string;
  /**
   * Details about the visit. What the vet said, what they prescribed, etc.
   *
   * #### Format `dev.superego:JsonObject.TiptapRichText`
   *
   * A rich-text document as represented, in JSON, by the Tiptap rich-text editor.
   *
   * Format examples:
   * - {"__dataType":"JsonObject","type":"doc","content":[]}
   * - {"__dataType":"JsonObject","type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Hello, World!"}]}]}
   */
  notes: JsonObject | null;
};
