import type { packsAsConst } from "@superego/boutique";
import type { TypeOf } from "@superego/schema";

type Account = TypeOf<(typeof packsAsConst)[2]["collections"][3]["schema"]>;

export default [
  {
    name: "Main Brokerage",
    broker: "Trade Republic",
    currency: "EUR",
    notes: null,
  },
  {
    name: "ETF Savings",
    broker: "Scalable Capital",
    currency: "EUR",
    notes: null,
  },
  {
    name: "Crypto",
    broker: "Kraken",
    currency: "EUR",
    notes: null,
  },
  {
    name: "US Stocks",
    broker: "Interactive Brokers",
    currency: "USD",
    notes: null,
  },
] satisfies Account[];
