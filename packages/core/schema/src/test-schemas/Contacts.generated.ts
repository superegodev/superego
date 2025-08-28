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
 * Type of contact.
 */
export enum Type {
  /**
   * A single human.
   */
  Person = "Person",
  /**
   * A company, non-profit, government entity, group, etc.
   */
  Organization = "Organization",
}

export type Phone = {
  /**
   * The actual phone number.
   */
  number: string;
  /**
   * A description for the phone number. (Personal, work, etc.)
   */
  description: string | null;
};

export type Email = {
  /**
   * The actual email address.
   */
  address: string;
  /**
   * A description for the email address. (Personal, work, etc.)
   */
  description: string | null;
};

/**
 * A contact in my address book.
 *
 * Note: This is the root type of this schema.
 */
export type Contact = {
  type: Type;
  /**
   * Name of the contact. Either the full name for a person, or the organization name for an organization.
   */
  name: string;
  /**
   * Who they are to me.
   */
  relation: string | null;
  /**
   * Their phone numbers
   */
  phones: Phone[];
  /**
   * Their email addresses
   */
  emails: Email[];
  /**
   * Misc notes about the contact
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
