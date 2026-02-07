import type { Pack } from "@superego/backend";
import car from "./packs/dev/superego/bazaar/car/pack.js";
import diet from "./packs/dev/superego/bazaar/diet/pack.js";
import finance from "./packs/dev/superego/bazaar/finance/pack.js";
import productivity from "./packs/dev/superego/bazaar/productivity/pack.js";

const packs: Pack[] = [car, diet, finance, productivity];
export default packs;
