import type { Pack } from "@superego/backend";
import car from "./packs/dev/superego/bazaar/car/pack.js";
import diet from "./packs/dev/superego/bazaar/diet/pack.js";
import finance from "./packs/dev/superego/bazaar/finance/pack.js";
import productivity from "./packs/dev/superego/bazaar/productivity/pack.js";

export const packsAsConst = [
  car,
  diet,
  finance,
  productivity,
] as const satisfies Pack[];

export const packs: Pack[] = packsAsConst;
