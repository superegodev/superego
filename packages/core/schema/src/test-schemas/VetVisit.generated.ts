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

/**
 * My pets.
 */
export enum Pet {
  /**
   * Cat.
   */
  Galois = "Galois",
  /**
   * Dog.
   */
  Abel = "Abel",
}

/**
 * A visit to the vet.
 *
 * Note: This is the root type of this schema.
 */
export type VetVisit = {
  /**
   * Which pet was brought.
   */
  pet: Pet;
  /**
   * Date of the visit.
   *
   * ## Format `dev.superego:String.PlainDate`
   *
   * A calendar date in the ISO8601 format, not associated with a particular time or time zone.
   *
   * ### Examples
   *
   * - "2006-08-24"
   * - "2024-02-29"
   * - "-000924-01-01"
   * - "0924-01-01"
   * - "+010924-01-01"
   */
  date: string;
  /**
   * Short title for the visit. 5 words max.
   */
  title: string;
  /**
   * Which vet the pet was brought to.
   */
  vet: string;
  /**
   * Details about the visit. What the vet said, what they prescribed, etc.
   *
   * ## Format `dev.superego:JsonObject.TiptapRichText`
   *
   * A rich-text document as represented, in JSON, by the Tiptap rich-text editor.
   *
   * ### Examples
   *
   * - {"__dataType":"JsonObject","type":"doc","content":[]}
   * - {"__dataType":"JsonObject","type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Hello, World!"}]}]}
   */
  notes: JsonObject | null;
};
