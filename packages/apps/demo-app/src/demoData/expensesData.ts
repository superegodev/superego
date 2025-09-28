import { DataType, type JsonObject } from "@superego/schema";
import { DateTime } from "luxon";

type Category =
  | "Housing"
  | "Utilities"
  | "Groceries"
  | "Dining And Takeout"
  | "Transportation"
  | "Health And Medical"
  | "Insurance"
  | "Debt And Loans"
  | "Entertainment And Subscriptions"
  | "Shopping And Personal Care"
  | "Other";
type PaymentMethod = "Credit Card" | "Debit Card" | "Cash";
interface Expense {
  title: string;
  date: string;
  amount: number;
  currency: string;
  category: Category;
  paymentMethod: PaymentMethod | null;
  notes: JsonObject | null;
}
export default [
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: -11 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: -11 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: -11 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Flight VNO -> MXP",
    date: DateTime.now().plus({ months: -11 }).set({ day: 5 }).toISODate(),
    amount: 186.4,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Outbound flight for Milan visit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: -11 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Brera Airbnb",
    date: DateTime.now().plus({ months: -11 }).set({ day: 6 }).toISODate(),
    amount: 310,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Seven-night stay near Moscova",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: -11 }).set({ day: 9 }).toISODate(),
    amount: 89.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Return flight MXP -> VNO",
    date: DateTime.now().plus({ months: -11 }).set({ day: 12 }).toISODate(),
    amount: 179.8,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Return from Milan visit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: -11 }).set({ day: 13 }).toISODate(),
    amount: 25.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: -11 }).set({ day: 15 }).toISODate(),
    amount: 124,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: -11 }).set({ day: 22 }).toISODate(),
    amount: 63.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: -10 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: -10 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: -10 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: -10 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: -10 }).set({ day: 9 }).toISODate(),
    amount: 94.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Vet vaccination",
    date: DateTime.now().plus({ months: -10 }).set({ day: 11 }).toISODate(),
    amount: 45,
    currency: "EUR",
    category: "Health And Medical",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Cat vaccination at Vilnius vet",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: -10 }).set({ day: 13 }).toISODate(),
    amount: 29.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: -10 }).set({ day: 15 }).toISODate(),
    amount: 130,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Netflix and Spotify",
    date: DateTime.now().plus({ months: -10 }).set({ day: 18 }).toISODate(),
    amount: 21.98,
    currency: "EUR",
    category: "Entertainment And Subscriptions",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Streaming bundle auto-debit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: -10 }).set({ day: 22 }).toISODate(),
    amount: 67.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: -9 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: -9 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: -9 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: -9 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: -9 }).set({ day: 9 }).toISODate(),
    amount: 74.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Italo ticket Turin",
    date: DateTime.now().plus({ months: -9 }).set({ day: 10 }).toISODate(),
    amount: 46.2,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "High-speed train during Turin visit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Turin trattoria dinner",
    date: DateTime.now().plus({ months: -9 }).set({ day: 11 }).toISODate(),
    amount: 58.5,
    currency: "EUR",
    category: "Dining And Takeout",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Dinner with Paolo and team",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: -9 }).set({ day: 13 }).toISODate(),
    amount: 21.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: -9 }).set({ day: 15 }).toISODate(),
    amount: 112,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: -9 }).set({ day: 22 }).toISODate(),
    amount: 71.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Gym drop-in",
    date: DateTime.now().plus({ months: -9 }).set({ day: 27 }).toISODate(),
    amount: 12,
    currency: "EUR",
    category: "Health And Medical",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Impuls gym sauna session",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: -8 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Flight VNO -> BKK",
    date: DateTime.now().plus({ months: -8 }).set({ day: 1 }).toISODate(),
    amount: 742.7,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Round-trip ticket for SE Asia adventure",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: -8 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: -8 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: -8 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Chiang Mai cooking class fee",
    date: DateTime.now().plus({ months: -8 }).set({ day: 7 }).toISODate(),
    amount: 2600,
    currency: "THB",
    category: "Entertainment And Subscriptions",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Market tour and lesson from calendar event",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: -8 }).set({ day: 9 }).toISODate(),
    amount: 79.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: -8 }).set({ day: 13 }).toISODate(),
    amount: 25.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Souvenir coffee beans",
    date: DateTime.now().plus({ months: -8 }).set({ day: 13 }).toISODate(),
    amount: 480,
    currency: "THB",
    category: "Shopping And Personal Care",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Beans from Ristr8to Roasters in Chiang Mai",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat dental cleaning",
    date: DateTime.now().plus({ months: -8 }).set({ day: 14 }).toISODate(),
    amount: 68,
    currency: "EUR",
    category: "Health And Medical",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Routine dental check",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: -8 }).set({ day: 15 }).toISODate(),
    amount: 118,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Bangkok co-working day pass",
    date: DateTime.now().plus({ months: -8 }).set({ day: 16 }).toISODate(),
    amount: 650,
    currency: "THB",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Day desk at True Digital Park",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: -8 }).set({ day: 22 }).toISODate(),
    amount: 75.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: -7 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: -7 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: -7 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: -7 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rome apartment rental",
    date: DateTime.now().plus({ months: -7 }).set({ day: 6 }).toISODate(),
    amount: 420,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Monti district flat for Rome visit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: -7 }).set({ day: 9 }).toISODate(),
    amount: 84.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: -7 }).set({ day: 13 }).toISODate(),
    amount: 29.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: -7 }).set({ day: 15 }).toISODate(),
    amount: 124,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Netflix and Spotify",
    date: DateTime.now().plus({ months: -7 }).set({ day: 18 }).toISODate(),
    amount: 21.98,
    currency: "EUR",
    category: "Entertainment And Subscriptions",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Streaming bundle auto-debit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Physiotherapy session",
    date: DateTime.now().plus({ months: -7 }).set({ day: 18 }).toISODate(),
    amount: 48,
    currency: "EUR",
    category: "Health And Medical",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Session aligned with calendar appointment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: -7 }).set({ day: 22 }).toISODate(),
    amount: 79.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: -6 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: -6 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: -6 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: -6 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: -6 }).set({ day: 9 }).toISODate(),
    amount: 89.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: -6 }).set({ day: 13 }).toISODate(),
    amount: 21.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: -6 }).set({ day: 15 }).toISODate(),
    amount: 130,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: -6 }).set({ day: 22 }).toISODate(),
    amount: 59.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: -5 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: -5 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: -5 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Dental cleaning",
    date: DateTime.now().plus({ months: -5 }).set({ day: 5 }).toISODate(),
    amount: 72,
    currency: "EUR",
    category: "Health And Medical",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Kaunas dental visit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: -5 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: -5 }).set({ day: 9 }).toISODate(),
    amount: 94.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: -5 }).set({ day: 13 }).toISODate(),
    amount: 25.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Puglia car rental",
    date: DateTime.now().plus({ months: -5 }).set({ day: 14 }).toISODate(),
    amount: 389,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Three-week rental during Puglia stay",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: -5 }).set({ day: 15 }).toISODate(),
    amount: 112,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Family dinner in Monopoli",
    date: DateTime.now().plus({ months: -5 }).set({ day: 17 }).toISODate(),
    amount: 86,
    currency: "EUR",
    category: "Dining And Takeout",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Seafood dinner from calendar meetup",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: -5 }).set({ day: 22 }).toISODate(),
    amount: 63.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Gym drop-in",
    date: DateTime.now().plus({ months: -5 }).set({ day: 27 }).toISODate(),
    amount: 12,
    currency: "EUR",
    category: "Health And Medical",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Impuls gym sauna session",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: -4 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: -4 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: -4 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: -4 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: -4 }).set({ day: 9 }).toISODate(),
    amount: 74.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: -4 }).set({ day: 13 }).toISODate(),
    amount: 29.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: -4 }).set({ day: 15 }).toISODate(),
    amount: 118,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Netflix and Spotify",
    date: DateTime.now().plus({ months: -4 }).set({ day: 18 }).toISODate(),
    amount: 21.98,
    currency: "EUR",
    category: "Entertainment And Subscriptions",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Streaming bundle auto-debit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Vilnius JS sponsorship",
    date: DateTime.now().plus({ months: -4 }).set({ day: 19 }).toISODate(),
    amount: 60,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Snacks for meetup Mindaugas organizes",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: -4 }).set({ day: 22 }).toISODate(),
    amount: 67.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: -3 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: -3 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: -3 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: -3 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Climbing gym day pass",
    date: DateTime.now().plus({ months: -3 }).set({ day: 8 }).toISODate(),
    amount: 14,
    currency: "EUR",
    category: "Entertainment And Subscriptions",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vertical gym session with Greta",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: -3 }).set({ day: 9 }).toISODate(),
    amount: 79.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Florence museum passes",
    date: DateTime.now().plus({ months: -3 }).set({ day: 9 }).toISODate(),
    amount: 45,
    currency: "EUR",
    category: "Entertainment And Subscriptions",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Uffizi and Accademia timed tickets",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: -3 }).set({ day: 13 }).toISODate(),
    amount: 21.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: -3 }).set({ day: 15 }).toISODate(),
    amount: 124,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Vet allergy follow-up",
    date: DateTime.now().plus({ months: -3 }).set({ day: 20 }).toISODate(),
    amount: 52,
    currency: "EUR",
    category: "Health And Medical",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Follow-up visit for allergy treatment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: -3 }).set({ day: 22 }).toISODate(),
    amount: 71.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: -2 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: -2 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: -2 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: -2 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Eye exam copay",
    date: DateTime.now().plus({ months: -2 }).set({ day: 7 }).toISODate(),
    amount: 35,
    currency: "EUR",
    category: "Health And Medical",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Optometrist check",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: -2 }).set({ day: 9 }).toISODate(),
    amount: 84.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: -2 }).set({ day: 13 }).toISODate(),
    amount: 25.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Language exchange coffees",
    date: DateTime.now().plus({ months: -2 }).set({ day: 14 }).toISODate(),
    amount: 12,
    currency: "EUR",
    category: "Dining And Takeout",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Coffee with Kotryna at Vilnius University library",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: -2 }).set({ day: 15 }).toISODate(),
    amount: 130,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: -2 }).set({ day: 22 }).toISODate(),
    amount: 75.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: -1 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: -1 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: -1 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: -1 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: -1 }).set({ day: 9 }).toISODate(),
    amount: 89.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Flight VNO -> FCO",
    date: DateTime.now().plus({ months: -1 }).set({ day: 9 }).toISODate(),
    amount: 205.2,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Holiday flights for Rome visit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: -1 }).set({ day: 13 }).toISODate(),
    amount: 29.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking day pass - Rome",
    date: DateTime.now().plus({ months: -1 }).set({ day: 14 }).toISODate(),
    amount: 25,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Impact Hub Roma day desk",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: -1 }).set({ day: 15 }).toISODate(),
    amount: 108,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Netflix and Spotify",
    date: DateTime.now().plus({ months: -1 }).set({ day: 18 }).toISODate(),
    amount: 21.98,
    currency: "EUR",
    category: "Entertainment And Subscriptions",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Streaming bundle auto-debit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: -1 }).set({ day: 22 }).toISODate(),
    amount: 79.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Gym drop-in",
    date: DateTime.now().plus({ months: -1 }).set({ day: 27 }).toISODate(),
    amount: 12,
    currency: "EUR",
    category: "Health And Medical",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Impuls gym sauna session",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Grooming appointment",
    date: DateTime.now().plus({ months: -1 }).set({ day: 28 }).toISODate(),
    amount: 40,
    currency: "EUR",
    category: "Health And Medical",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Cat grooming before travel",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: 0 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: 0 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: 0 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: 0 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: 0 }).set({ day: 9 }).toISODate(),
    amount: 94.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cardio check consult",
    date: DateTime.now().plus({ months: 0 }).set({ day: 9 }).toISODate(),
    amount: 55,
    currency: "EUR",
    category: "Health And Medical",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Pre-USA trip visit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: 0 }).set({ day: 13 }).toISODate(),
    amount: 21.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: 0 }).set({ day: 15 }).toISODate(),
    amount: 114,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Flight VNO -> JFK",
    date: DateTime.now().plus({ months: 0 }).set({ day: 18 }).toISODate(),
    amount: 812.5,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Round-trip ticket for USA road trip",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: 0 }).set({ day: 22 }).toISODate(),
    amount: 59.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Brooklyn brunch",
    date: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 21 })
      .plus({ days: 5 })
      .toISODate(),
    amount: 68.4,
    currency: "USD",
    category: "Dining And Takeout",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Brunch with college friends in Williamsburg",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: 1 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Blue Ridge cabin",
    date: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 21 })
      .plus({ days: 11 })
      .toISODate(),
    amount: 524.9,
    currency: "USD",
    category: "Housing",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Week-long rental during Parkway drive",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: 1 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: 1 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: 1 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "New Orleans jazz cover",
    date: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 21 })
      .plus({ days: 17 })
      .toISODate(),
    amount: 30,
    currency: "USD",
    category: "Entertainment And Subscriptions",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Preservation Hall evening show",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Jazz club drinks",
    date: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 21 })
      .plus({ days: 17 })
      .toISODate(),
    amount: 24,
    currency: "USD",
    category: "Dining And Takeout",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Drinks during New Orleans show",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: 1 }).set({ day: 9 }).toISODate(),
    amount: 74.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: 1 }).set({ day: 13 }).toISODate(),
    amount: 25.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: 1 }).set({ day: 15 }).toISODate(),
    amount: 120,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: 1 }).set({ day: 22 }).toISODate(),
    amount: 63.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Return flight FCO -> VNO",
    date: DateTime.now().plus({ months: 1 }).set({ day: 25 }).toISODate(),
    amount: 214.6,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Return after future Rome visit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Monthly transit pass",
    date: DateTime.now().plus({ months: 2 }).set({ day: 1 }).toISODate(),
    amount: 29,
    currency: "EUR",
    category: "Transportation",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilniečio card renewal",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Coworking membership",
    date: DateTime.now().plus({ months: 2 }).set({ day: 3 }).toISODate(),
    amount: 185,
    currency: "EUR",
    category: "Other",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Hot desk plan at VilniaCode Hub",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Rent - Pilies loft",
    date: DateTime.now().plus({ months: 2 }).set({ day: 5 }).toISODate(),
    amount: 950,
    currency: "EUR",
    category: "Housing",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Paid to landlord Lina Kairiene for Vilnius apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Mobile plan",
    date: DateTime.now().plus({ months: 2 }).set({ day: 6 }).toISODate(),
    amount: 19.9,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Telia mobile plan with roaming",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Iki groceries haul",
    date: DateTime.now().plus({ months: 2 }).set({ day: 9 }).toISODate(),
    amount: 79.9,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Weekly staples for apartment",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Cat supplies for Miso",
    date: DateTime.now().plus({ months: 2 }).set({ day: 13 }).toISODate(),
    amount: 29.5,
    currency: "EUR",
    category: "Shopping And Personal Care",
    paymentMethod: "Debit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Litter and treats from PetCity",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Utilities and internet",
    date: DateTime.now().plus({ months: 2 }).set({ day: 15 }).toISODate(),
    amount: 126,
    currency: "EUR",
    category: "Utilities",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Enefit electricity plus Telia fiber bundle",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Netflix and Spotify",
    date: DateTime.now().plus({ months: 2 }).set({ day: 18 }).toISODate(),
    amount: 21.98,
    currency: "EUR",
    category: "Entertainment And Subscriptions",
    paymentMethod: "Credit Card",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Streaming bundle auto-debit",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Halė market produce",
    date: DateTime.now().plus({ months: 2 }).set({ day: 22 }).toISODate(),
    amount: 67.4,
    currency: "EUR",
    category: "Groceries",
    paymentMethod: "Cash",
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fresh vegetables and bread from Halės turgus vendors",
            },
          ],
        },
      ],
    },
  },
] satisfies Expense[];
