import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    SecurityType: {
      dataType: DataType.Enum,
      members: {
        Stock: { value: "Stock" },
        ETF: { value: "ETF" },
        Bond: { value: "Bond" },
        Crypto: { value: "Crypto" },
      },
      membersOrder: ["Stock", "ETF", "Bond", "Crypto"],
    },
    PriceSnapshot: {
      description: "A single price observation at a point in time",
      dataType: DataType.Struct,
      properties: {
        instant: {
          description: "Timestamp of the price observation",
          dataType: DataType.String,
          format: "dev.superego:String.Instant",
        },
        price: {
          description: "Price of the security at this point in time",
          dataType: DataType.Number,
        },
      },
    },
    Security: {
      description: "A security in the catalogue",
      dataType: DataType.Struct,
      properties: {
        name: {
          description: "Security name",
          dataType: DataType.String,
        },
        ticker: {
          description: "Ticker symbol",
          dataType: DataType.String,
        },
        type: {
          description: "Type of security",
          dataType: null,
          ref: "SecurityType",
        },
        currency: {
          description: "Currency code (e.g. EUR, USD)",
          dataType: DataType.String,
        },
        exchange: {
          description: "Exchange or market",
          dataType: DataType.String,
        },
        sector: {
          description: "Sector or industry",
          dataType: DataType.String,
        },
        isin: {
          description: "ISIN identifier",
          dataType: DataType.String,
        },
        priceHistory: {
          description: "Historical price observations",
          dataType: DataType.List,
          items: { dataType: null, ref: "PriceSnapshot" },
        },
      },
      nullableProperties: ["exchange", "sector", "isin"],
    },
  },
  rootType: "Security",
} as const satisfies Schema;
