import type { packsAsConst } from "@superego/boutique";
import type { TypeOf } from "@superego/schema";

type Holding = TypeOf<(typeof packsAsConst)[2]["collections"][2]["schema"]>;

// Document ordering in the pack:
// ProtoDocument_0-3:  accounts  (ProtoCollection_3)
// ProtoDocument_4-11: securities (ProtoCollection_1)
// ProtoDocument_12+:  expenses  (ProtoCollection_0)
// After expenses:     holdings  (ProtoCollection_2)
//
// Account references:
//   ProtoDocument_0 = Main Brokerage
//   ProtoDocument_1 = ETF Savings
//   ProtoDocument_2 = Crypto
//   ProtoDocument_3 = US Stocks
//
// Security references:
//   ProtoDocument_4  = SAP
//   ProtoDocument_5  = iShares MSCI World
//   ProtoDocument_6  = Bitcoin
//   ProtoDocument_7  = ASML
//   ProtoDocument_8  = TotalEnergies
//   ProtoDocument_9  = Apple
//   ProtoDocument_10 = Microsoft
//   ProtoDocument_11 = NVIDIA

export default [
  {
    security: {
      collectionId: "ProtoCollection_1",
      documentId: "ProtoDocument_4",
    },
    account: {
      collectionId: "ProtoCollection_3",
      documentId: "ProtoDocument_0",
    },
    notes: null,
    transactions: [
      {
        type: "Buy",
        date: "2019-04-15",
        quantity: 25,
        pricePerUnit: 92,
        fees: 1,
      },
      {
        type: "Buy",
        date: "2022-06-10",
        quantity: 15,
        pricePerUnit: 98,
        fees: 1,
      },
    ],
  },
  {
    security: {
      collectionId: "ProtoCollection_1",
      documentId: "ProtoDocument_5",
    },
    account: {
      collectionId: "ProtoCollection_3",
      documentId: "ProtoDocument_1",
    },
    notes: "Monthly DCA into world index",
    transactions: [
      {
        type: "Buy",
        date: "2019-06-15",
        quantity: 50,
        pricePerUnit: 38,
        fees: 0.99,
      },
      {
        type: "Buy",
        date: "2020-04-15",
        quantity: 50,
        pricePerUnit: 40,
        fees: 0.99,
      },
      {
        type: "Buy",
        date: "2021-06-15",
        quantity: 50,
        pricePerUnit: 58,
        fees: 0.99,
      },
      {
        type: "Buy",
        date: "2022-06-15",
        quantity: 50,
        pricePerUnit: 70,
        fees: 0.99,
      },
      {
        type: "Buy",
        date: "2024-06-15",
        quantity: 50,
        pricePerUnit: 80,
        fees: 0.99,
      },
    ],
  },
  {
    security: {
      collectionId: "ProtoCollection_1",
      documentId: "ProtoDocument_6",
    },
    account: {
      collectionId: "ProtoCollection_3",
      documentId: "ProtoDocument_2",
    },
    notes: null,
    transactions: [
      {
        type: "Buy",
        date: "2018-02-10",
        quantity: 0.5,
        pricePerUnit: 6200,
        fees: null,
      },
      {
        type: "Buy",
        date: "2020-12-15",
        quantity: 0.3,
        pricePerUnit: 8500,
        fees: null,
      },
      {
        type: "Sell",
        date: "2021-11-10",
        quantity: 0.2,
        pricePerUnit: 52000,
        fees: null,
      },
    ],
  },
  {
    security: {
      collectionId: "ProtoCollection_1",
      documentId: "ProtoDocument_7",
    },
    account: {
      collectionId: "ProtoCollection_3",
      documentId: "ProtoDocument_0",
    },
    notes: "Core semiconductor position",
    transactions: [
      {
        type: "Buy",
        date: "2019-05-20",
        quantity: 8,
        pricePerUnit: 165,
        fees: 1,
      },
      {
        type: "Buy",
        date: "2021-06-14",
        quantity: 5,
        pricePerUnit: 490,
        fees: 1,
      },
    ],
  },
  {
    security: {
      collectionId: "ProtoCollection_1",
      documentId: "ProtoDocument_8",
    },
    account: {
      collectionId: "ProtoCollection_3",
      documentId: "ProtoDocument_0",
    },
    notes: null,
    transactions: [
      {
        type: "Buy",
        date: "2018-09-10",
        quantity: 40,
        pricePerUnit: 42,
        fees: 1,
      },
      {
        type: "Sell",
        date: "2023-05-15",
        quantity: 20,
        pricePerUnit: 54,
        fees: 1,
      },
      {
        type: "Buy",
        date: "2024-06-20",
        quantity: 25,
        pricePerUnit: 60,
        fees: 1,
      },
    ],
  },
  {
    security: {
      collectionId: "ProtoCollection_1",
      documentId: "ProtoDocument_9",
    },
    account: {
      collectionId: "ProtoCollection_3",
      documentId: "ProtoDocument_3",
    },
    notes: null,
    transactions: [
      {
        type: "Buy",
        date: "2018-05-14",
        quantity: 30,
        pricePerUnit: 49,
        fees: 2,
      },
      {
        type: "Buy",
        date: "2021-03-08",
        quantity: 20,
        pricePerUnit: 120,
        fees: 2,
      },
    ],
  },
  {
    security: {
      collectionId: "ProtoCollection_1",
      documentId: "ProtoDocument_10",
    },
    account: {
      collectionId: "ProtoCollection_3",
      documentId: "ProtoDocument_3",
    },
    notes: null,
    transactions: [
      {
        type: "Buy",
        date: "2018-10-22",
        quantity: 15,
        pricePerUnit: 95,
        fees: 2,
      },
      {
        type: "Buy",
        date: "2021-04-05",
        quantity: 10,
        pricePerUnit: 235,
        fees: 2,
      },
    ],
  },
  {
    security: {
      collectionId: "ProtoCollection_1",
      documentId: "ProtoDocument_11",
    },
    account: {
      collectionId: "ProtoCollection_3",
      documentId: "ProtoDocument_3",
    },
    notes: "AI bet",
    transactions: [
      {
        type: "Buy",
        date: "2020-06-15",
        quantity: 200,
        pricePerUnit: 5.5,
        fees: 2,
      },
      {
        type: "Buy",
        date: "2023-05-20",
        quantity: 100,
        pricePerUnit: 28,
        fees: 2,
      },
    ],
  },
] satisfies Holding[];
