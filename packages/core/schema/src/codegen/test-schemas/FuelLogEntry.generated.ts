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

/** Type of fuel that can be used for refuelling. */
export type FuelType = 
  /** Gasoline, 95 octane, E5. */
  | "G95E5"
  | "G95E10"
  | "G98E5"
  | "G98E10";

/**
 * A single refuelling event.
 *
 * Note: This is the root type of this schema.
 */
export type FuelLogEntry = {
  /** My vehicles. */
  vehicle: 
    /** My main car. */
    | "Kia Sportage"
    /** My motorbike. */
    | "Kawasaki Ninja";
  /**
   * Timestamp of the refueling event.
   *
   * #### Format `dev.superego:String.Instant`
   *
   * An exact point in time in the ISO8601 format, with millisecond precision, with a specified time offset.
   *
   * Format examples:
   * - "2006-08-24T19:39:09.000Z"
   * - "2006-08-24T22:39:09.068+03:00"
   */
  timestamp: string;
  /** Odometer reading at the time of refueling, in kilometers. */
  odometer: number;
  /** Number of liters of fuel added. */
  liters: number;
  /** Total cost of refueling. */
  totalCost: number;
  /** Indicates if the tank was filled completely. */
  fullTank: boolean;
  /** Price per liter of fuel. */
  pricePerLiter: number | null;
  /** Type of fuel used for the refuelling. */
  fuelType: FuelType | null;
  /**
   * Any additional notes.
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
