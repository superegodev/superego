import type { Pack } from "@superego/backend";
import car from "./packs/dev/superego/bazaar/car/pack.js";
import health from "./packs/dev/superego/bazaar/health/pack.js";
import personalFinance from "./packs/dev/superego/bazaar/personal-finance/pack.js";
import productivity from "./packs/dev/superego/bazaar/productivity/pack.js";

export const packsAsConst = [
  car,
  health,
  personalFinance,
  productivity,
] as const satisfies Pack[];

export const packs: Pack[] = packsAsConst;
