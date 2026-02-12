import type { packsAsConst } from "@superego/bazaar";
import { DataType, type TypeOf } from "@superego/schema";
import { DateTime } from "luxon";

type Expense = TypeOf<(typeof packsAsConst)[2]["collections"][0]["schema"]>;

const recurringExpenses = (
  [
    {
      title: "Monthly transit pass",
      dayOfMonth: 28,
      amount: 29,
      currency: "EUR",
      category: "Transportation",
      paymentMethod: "Bank Transfer",
      notes: null,
    },
    {
      title: "Coworking membership",
      dayOfMonth: 4,
      amount: 185,
      currency: "EUR",
      category: "Other",
      paymentMethod: "Bank Transfer",
      notes: null,
    },
    {
      title: "Rent - Pilies loft",
      dayOfMonth: 1,
      amount: 950,
      currency: "EUR",
      category: "Housing",
      paymentMethod: "Bank Transfer",
      notes: null,
    },
    {
      title: "Mobile plan",
      dayOfMonth: 15,
      amount: 19.9,
      currency: "EUR",
      category: "Utilities",
      paymentMethod: "Bank Transfer",
      notes: null,
    },
    {
      title: "Apple TV+",
      dayOfMonth: 11,
      amount: 9.99,
      currency: "EUR",
      category: "Entertainment And Subscriptions",
      paymentMethod: "Credit Card",
      notes: null,
    },
    {
      title: "Gym sub",
      dayOfMonth: 27,
      amount: 22,
      currency: "EUR",
      category: "Entertainment And Subscriptions",
      paymentMethod: "Bank Transfer",
      notes: null,
    },
  ] as const
).flatMap((recurringExpense) => {
  const { dayOfMonth, ...expense } = recurringExpense;
  const expenses: Expense[] = [];
  const paidInCurrentMonth = recurringExpense.dayOfMonth <= DateTime.now().day;
  for (let i = paidInCurrentMonth ? 0 : 1; i <= 11; i++) {
    expenses.push({
      ...expense,
      date: DateTime.now()
        .minus({ months: i })
        .set({ day: dayOfMonth })
        .toISODate(),
    });
  }
  return expenses;
});

export default [
  ...recurringExpenses,
  {
    title: "Flight VNO -> MXP",
    date: DateTime.now().minus({ days: 334 }).toISODate(),
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
    title: "Brera Airbnb",
    date: DateTime.now().minus({ days: 333 }).toISODate(),
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
    title: "Return flight MXP -> VNO",
    date: DateTime.now().minus({ days: 327 }).toISODate(),
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
    title: "Vet vaccination",
    date: DateTime.now().minus({ days: 298 }).toISODate(),
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
    title: "Italo ticket Turin",
    date: DateTime.now().minus({ days: 268 }).toISODate(),
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
    date: DateTime.now().minus({ days: 267 }).toISODate(),
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
    title: "Flight VNO -> BKK",
    date: DateTime.now().minus({ days: 246 }).toISODate(),
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
    title: "Chiang Mai cooking class fee",
    date: DateTime.now().minus({ days: 240 }).toISODate(),
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
    title: "Souvenir coffee beans",
    date: DateTime.now().minus({ days: 234 }).toISODate(),
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
    date: DateTime.now().minus({ days: 233 }).toISODate(),
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
    title: "Bangkok co-working day pass",
    date: DateTime.now().minus({ days: 231 }).toISODate(),
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
    title: "Rome apartment rental",
    date: DateTime.now().minus({ days: 213 }).toISODate(),
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
    title: "Physiotherapy session",
    date: DateTime.now().minus({ days: 201 }).toISODate(),
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
    title: "Dental cleaning",
    date: DateTime.now().minus({ days: 153 }).toISODate(),
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
    title: "Puglia car rental",
    date: DateTime.now().minus({ days: 144 }).toISODate(),
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
    title: "Family dinner in Monopoli",
    date: DateTime.now().minus({ days: 141 }).toISODate(),
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
    title: "Vilnius JS sponsorship",
    date: DateTime.now().minus({ days: 108 }).toISODate(),
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
    title: "Climbing gym day pass",
    date: DateTime.now().minus({ days: 89 }).toISODate(),
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
    title: "Florence museum passes",
    date: DateTime.now().minus({ days: 88 }).toISODate(),
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
    title: "Vet allergy follow-up",
    date: DateTime.now().minus({ days: 77 }).toISODate(),
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
    title: "Eye exam copay",
    date: DateTime.now().minus({ days: 59 }).toISODate(),
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
    title: "Language exchange coffees",
    date: DateTime.now().minus({ days: 52 }).toISODate(),
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
    title: "Flight VNO -> FCO",
    date: DateTime.now().minus({ days: 26 }).toISODate(),
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
    title: "Coworking day pass - Rome",
    date: DateTime.now().minus({ days: 21 }).toISODate(),
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
    title: "Grooming appointment",
    date: DateTime.now().minus({ days: 7 }).toISODate(),
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
    title: "Cardio check consult",
    date: DateTime.now().minus({ days: 26 }).toISODate(),
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
    title: "Flight VNO -> JFK",
    date: DateTime.now().minus({ days: 17 }).toISODate(),
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
    title: "Brooklyn brunch",
    date: DateTime.now().minus({ days: 9 }).toISODate(),
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
    title: "Blue Ridge cabin",
    date: DateTime.now().minus({ days: 3 }).toISODate(),
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
    title: "New Orleans jazz cover",
    date: DateTime.now().minus({ days: 14 }).toISODate(),
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
    date: DateTime.now().minus({ days: 14 }).toISODate(),
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
    title: "Return flight FCO -> VNO",
    date: DateTime.now().minus({ days: 10 }).toISODate(),
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
] satisfies Expense[];
