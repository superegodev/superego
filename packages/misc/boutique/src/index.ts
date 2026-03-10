import type { Pack } from "@superego/backend";
import car from "./packs/dev/superego/boutique/car/pack.js";
import health from "./packs/dev/superego/boutique/health/pack.js";
import personalFinance from "./packs/dev/superego/boutique/personal-finance/pack.js";
import productivity from "./packs/dev/superego/boutique/productivity/pack.js";

export const packsAsConst = [
  productivity,
  health,
  personalFinance,
  car,
] as const satisfies Pack[];

export const packs: Pack[] = packsAsConst;
