import * as v from "valibot";

/** The variable part must be a reverse domain name. */
type PackId = `Pack_${string}`;
const PackIdSchema = v.pipe(
  v.string(),
  v.regex(/^Pack_[a-zA-Z0-9.-]+$/),
) as v.GenericSchema<PackId, PackId>;
export default PackIdSchema;
export type { PackId };
