import { DataType } from "@superego/schema";
import type Data from "./Data.js";

export default {
  collectionCategories: {
    CollectionCategory_CSZixTLiGFTkQpZscYArp: {
      id: "CollectionCategory_CSZixTLiGFTkQpZscYArp",
      name: "Health",
      icon: "🍎",
      parentId: null,
      createdAt: new Date("2025-08-28T07:36:38.797Z"),
    },
    CollectionCategory_CSZixeerL8J1NLc9fxkyP: {
      id: "CollectionCategory_CSZixeerL8J1NLc9fxkyP",
      name: "Home",
      icon: "🏡",
      parentId: null,
      createdAt: new Date("2025-08-28T07:36:41.443Z"),
    },
    CollectionCategory_CSZixfWCcrRtUUGJ74YT4: {
      id: "CollectionCategory_CSZixfWCcrRtUUGJ74YT4",
      name: "Finance",
      icon: "💰️",
      parentId: null,
      createdAt: new Date("2025-08-28T07:36:41.642Z"),
    },
    CollectionCategory_CSZixgP32gyVrtnq4QCrc: {
      id: "CollectionCategory_CSZixgP32gyVrtnq4QCrc",
      name: "Vehicles",
      icon: "🛞",
      parentId: null,
      createdAt: new Date("2025-08-28T07:36:41.847Z"),
    },
  },
  collections: {
    Collection_CSZsPQvyvT7J2PttWv1Cy: {
      id: "Collection_CSZsPQvyvT7J2PttWv1Cy",
      settings: {
        name: "Calendar",
        icon: "📅",
        collectionCategoryId: null,
        description: null,
        assistantInstructions:
          "- If the duration is not supplied for events, default to them being 1 hour long.",
      },
      createdAt: new Date("2025-08-28T09:27:11.952Z"),
    },
    Collection_CSZsYNxB2S24GWXz8k95B: {
      id: "Collection_CSZsYNxB2S24GWXz8k95B",
      settings: {
        name: "Fuel Log",
        icon: "⛽️",
        collectionCategoryId: "CollectionCategory_CSZixgP32gyVrtnq4QCrc",
        description: "Tracks when I refuel my vehicles.",
        assistantInstructions: [
          "- Use reasonable values for liters and total cost. E.g., if I say I put 5304 liters, I probably mean 53.04, even if I didn't specify the decimal.",
          "- Default to full tank if I don't specify it.",
        ].join("\n"),
      },
      createdAt: new Date("2025-08-28T09:29:13.582Z"),
    },
    Collection_CSZsv1e8QqfJTrALkYEWN: {
      id: "Collection_CSZsv1e8QqfJTrALkYEWN",
      settings: {
        name: "Expenses",
        icon: "💸",
        collectionCategoryId: "CollectionCategory_CSZixfWCcrRtUUGJ74YT4",
        description: null,
        assistantInstructions: [
          "- If the currency is not supplied, default to EUR.",
          "- If the payment method is not supplied, default to Credit Card.",
        ].join("\n"),
      },
      createdAt: new Date("2025-08-28T09:34:07.048Z"),
    },
    Collection_CSZt7rdynZLdoJupfrJ9k: {
      id: "Collection_CSZt7rdynZLdoJupfrJ9k",
      settings: {
        name: "Foods",
        icon: "🍗",
        collectionCategoryId: "CollectionCategory_CSZixTLiGFTkQpZscYArp",
        description: "Registry of foods with their nutrition information.",
        assistantInstructions: null,
      },
      createdAt: new Date("2025-08-28T09:36:47.733Z"),
    },
    Collection_CSZtEQ9UDJsPHB3KnXWKf: {
      id: "Collection_CSZtEQ9UDJsPHB3KnXWKf",
      settings: {
        name: "Meals",
        icon: "🍽️",
        collectionCategoryId: "CollectionCategory_CSZixTLiGFTkQpZscYArp",
        description: null,
        assistantInstructions: [
          "- Try to infer the meal type from the amount of food I consumed (small amount -> snack) and from the time: from 7 to 9 -> breakfast; from 12 to 14 -> lunch; from 18 to 20 -> dinner. Ask if unsure.",
        ].join("\n"),
      },
      createdAt: new Date("2025-08-28T09:38:16.498Z"),
    },
    Collection_CSZtNQiv6xaohffqQvPJR: {
      id: "Collection_CSZtNQiv6xaohffqQvPJR",
      settings: {
        name: "Contacts",
        icon: "👥",
        collectionCategoryId: null,
        description: null,
        assistantInstructions: null,
      },
      createdAt: new Date("2025-08-28T09:40:05.159Z"),
    },
    Collection_CSZtXKVtjeB2xspwyVsW4: {
      id: "Collection_CSZtXKVtjeB2xspwyVsW4",
      settings: {
        name: "Vet Visits",
        icon: "🐹",
        collectionCategoryId: "CollectionCategory_CSZixeerL8J1NLc9fxkyP",
        description: null,
        assistantInstructions: null,
      },
      createdAt: new Date("2025-08-28T09:42:06.031Z"),
    },
    Collection_CSZtbatUAnJNeXaxFJZgP: {
      id: "Collection_CSZtbatUAnJNeXaxFJZgP",
      settings: {
        name: "Weigh-ins",
        icon: "⚖️",
        collectionCategoryId: "CollectionCategory_CSZixTLiGFTkQpZscYArp",
        description: null,
        assistantInstructions: null,
      },
      createdAt: new Date("2025-08-28T09:43:03.894Z"),
    },
  },
  collectionVersions: {
    CollectionVersion_CSZsPQvyvT7J2RSbPdmgf: {
      id: "CollectionVersion_CSZsPQvyvT7J2RSbPdmgf",
      previousVersionId: null,
      collectionId: "Collection_CSZsPQvyvT7J2PttWv1Cy",
      schema: {
        types: {
          Type: {
            description: "Type of a calendar entry.",
            dataType: DataType.Enum,
            members: {
              Event: {
                description:
                  "An event, with a defined start time and a defined end time.",
                value: "Event",
              },
              Reminder: {
                description:
                  "A reminder, with a defined start time but no end time.",
                value: "Reminder",
              },
            },
          },
          CalendarEntry: {
            description: "An entry in my calendar.",
            dataType: DataType.Struct,
            properties: {
              type: {
                description: "The type of the entry.",
                dataType: null,
                ref: "Type",
              },
              title: {
                description: "Short title for the entry. 5 words max.",
                dataType: DataType.String,
              },
              startTime: {
                description: "When the event or reminder starts.",
                dataType: DataType.String,
                format: "dev.superego:String.Instant",
              },
              endTime: {
                description:
                  "When the event or reminder ends. Null for reminders.",
                dataType: DataType.String,
                format: "dev.superego:String.Instant",
              },
              notes: {
                description: "Misc notes.",
                dataType: DataType.JsonObject,
                format: "dev.superego:JsonObject.TiptapRichText",
              },
            },
            nullableProperties: ["endTime", "notes"],
          },
        },
        rootType: "CalendarEntry",
      },
      settings: {
        summaryProperties: [
          {
            name: "Title",
            description: "",
            getter: {
              source:
                'import { CalendarEntry } from "./CollectionSchema.js";\n\nexport default function getValue(calendarEntry: CalendarEntry): string {\n  return calendarEntry.title;\n}',
              compiled:
                "export default function getValue(calendarEntry) {\n    return calendarEntry.title;\n}\n",
            },
          },
          {
            name: "Type",
            description: "",
            getter: {
              source:
                'import { CalendarEntry } from "./CollectionSchema.js";\n\nexport default function getValue(calendarEntry: CalendarEntry): string {\n  return calendarEntry.type;\n}',
              compiled:
                "export default function getValue(calendarEntry) {\n    return calendarEntry.type;\n}\n",
            },
          },
          {
            name: "Starts",
            description: "",
            getter: {
              source:
                'import { CalendarEntry } from "./CollectionSchema.js";\n\nexport default function getValue(calendarEntry: CalendarEntry): string {\n  return calendarEntry.startTime.slice(0, 10) + " @ " + calendarEntry.startTime.slice(11, 16);\n}',
              compiled:
                'export default function getValue(calendarEntry) {\n    return calendarEntry.startTime.slice(0, 10) + " @ " + calendarEntry.startTime.slice(11, 16);\n}\n',
            },
          },
          {
            name: "Ends",
            description: "",
            getter: {
              source:
                'import { CalendarEntry } from "./CollectionSchema.js";\n\nexport default function getValue(calendarEntry: CalendarEntry): string {\n  if (!calendarEntry.endTime) {\n    return "";\n  }\n  return calendarEntry.endTime.slice(0, 10) + " @ " + calendarEntry.endTime.slice(11, 16);\n}',
              compiled:
                'export default function getValue(calendarEntry) {\n    if (!calendarEntry.endTime) {\n        return "";\n    }\n    return calendarEntry.endTime.slice(0, 10) + " @ " + calendarEntry.endTime.slice(11, 16);\n}\n',
            },
          },
        ],
      },
      migration: null,
      createdAt: new Date("2025-08-28T09:27:11.952Z"),
    },
    CollectionVersion_CSZsYNxB2S24GXt3EhVC3: {
      id: "CollectionVersion_CSZsYNxB2S24GXt3EhVC3",
      previousVersionId: null,
      collectionId: "Collection_CSZsYNxB2S24GWXz8k95B",
      schema: {
        types: {
          FuelType: {
            description: "Type of fuel that can be used for refuelling.",
            dataType: DataType.Enum,
            members: {
              Gasoline95: {
                description: "95 octane gasoline.",
                value: "Gasoline 95",
              },
              Gasoline98: {
                description: "98 octane gasoline.",
                value: "Gasoline 98",
              },
            },
          },
          Vehicle: {
            description: "My vehicles.",
            dataType: DataType.Enum,
            members: {
              KiaSportage: {
                description: "My main car.",
                value: "Kia Sportage",
              },
              KawasakiNinja: {
                description: "My motorbike.",
                value: "Kawasaki Ninja",
              },
            },
          },
          FuelLogEntry: {
            description: "A single refuelling event.",
            dataType: DataType.Struct,
            properties: {
              vehicle: {
                description: "Which vehicle was refuelled.",
                dataType: null,
                ref: "Vehicle",
              },
              timestamp: {
                description: "Timestamp of the refueling event.",
                dataType: DataType.String,
                format: "dev.superego:String.Instant",
              },
              odometer: {
                description:
                  "Odometer reading at the time of refueling, in kilometers.",
                dataType: DataType.Number,
              },
              liters: {
                description: "Number of liters of fuel added.",
                dataType: DataType.Number,
              },
              totalCost: {
                description: "Total cost of refueling.",
                dataType: DataType.Number,
              },
              fullTank: {
                description: "Indicates if the tank was filled completely.",
                dataType: DataType.Boolean,
              },
              pricePerLiter: {
                description: "Price per liter of fuel.",
                dataType: DataType.Number,
              },
              fuelType: {
                description: "Type of fuel used for the refuelling.",
                dataType: null,
                ref: "FuelType",
              },
              notes: {
                description: "Any additional notes.",
                dataType: DataType.JsonObject,
                format: "dev.superego:JsonObject.TiptapRichText",
              },
            },
            nullableProperties: ["pricePerLiter", "fuelType", "notes"],
          },
        },
        rootType: "FuelLogEntry",
      },
      settings: {
        summaryProperties: [
          {
            name: "Summary",
            description: "",
            getter: {
              source:
                'import { FuelLogEntry } from "./CollectionSchema.js";\n\nexport default function getValue(fuelLogEntry: FuelLogEntry): string {\n  const date = fuelLogEntry.timestamp.slice(0, 10);\n  const price = fuelLogEntry.totalCost + " €";\n  const liters = fuelLogEntry.liters + " l";\n  return [date, price, liters].join(" - ");\n}',
              compiled:
                'export default function getValue(fuelLogEntry) {\n    const date = fuelLogEntry.timestamp.slice(0, 10);\n    const price = fuelLogEntry.totalCost + " €";\n    const liters = fuelLogEntry.liters + " l";\n    return [date, price, liters].join(" - ");\n}\n',
            },
          },
        ],
      },
      migration: null,
      createdAt: new Date("2025-08-28T09:29:13.582Z"),
    },
    CollectionVersion_CSZsv1eNcGkM79wNhXHBz: {
      id: "CollectionVersion_CSZsv1eNcGkM79wNhXHBz",
      previousVersionId: null,
      collectionId: "Collection_CSZsv1e8QqfJTrALkYEWN",
      schema: {
        types: {
          Category: {
            description: "Category of the expense.",
            dataType: DataType.Enum,
            members: {
              Housing: {
                description:
                  "Rent or mortgage, property taxes, HOA dues, home repairs.",
                value: "Housing",
              },
              Utilities: {
                description: "Electricity, gas, water, trash, internet, phone.",
                value: "Utilities",
              },
              Groceries: {
                description: "Food and household staples for home.",
                value: "Groceries",
              },
              DiningAndTakeout: {
                description: "Restaurants, cafés, delivery, tips.",
                value: "DiningAndTakeout",
              },
              Transportation: {
                description:
                  "Fuel, public transit, rideshare, parking, maintenance.",
                value: "Transportation",
              },
              HealthAndMedical: {
                description: " Doctor visits, dental, prescriptions, copays.",
                value: "HealthAndMedical",
              },
              Insurance: {
                description: "Auto, health, home/renters, life premiums.",
                value: "Insurance",
              },
              DebtAndLoans: {
                description: "Credit card payments, student or auto loans.",
                value: "DebtAndLoans",
              },
              EntertainmentAndSubscriptions: {
                description: "Streaming, games, events, hobbies, apps.",
                value: "EntertainmentAndSubscriptions",
              },
              ShoppingAndPersonalCare: {
                description: "Clothing, toiletries, cosmetics, salon/barber.",
                value: "ShoppingAndPersonalCare",
              },
              Other: {
                value: "Other",
              },
            },
          },
          PaymentMethod: {
            description: "Details of the payment method used.",
            dataType: DataType.Enum,
            members: {
              CreditCard: {
                value: "Credit Card",
              },
              DebitCard: {
                value: "Debit Card",
              },
              Cash: {
                value: "Cash",
              },
            },
          },
          Expense: {
            description: "Represents a single financial expense.",
            dataType: DataType.Struct,
            properties: {
              title: {
                description: "Short title for the expense. 5 words max.",
                dataType: DataType.String,
              },
              date: {
                description: "Date of the expense.",
                dataType: DataType.String,
                format: "dev.superego:String.PlainDate",
              },
              amount: {
                description: "Amount of the expense.",
                dataType: DataType.Number,
              },
              currency: {
                description: "Currency code (e.g., EUR, USD).",
                dataType: DataType.StringLiteral,
                value: "EUR",
              },
              category: {
                dataType: null,
                ref: "Category",
              },
              paymentMethod: {
                dataType: null,
                ref: "PaymentMethod",
              },
              notes: {
                description: "Misc notes.",
                dataType: DataType.JsonObject,
                format: "dev.superego:JsonObject.TiptapRichText",
              },
            },
            nullableProperties: ["paymentMethod", "notes"],
          },
        },
        rootType: "Expense",
      },
      settings: {
        summaryProperties: [
          {
            name: "Title",
            description: "",
            getter: {
              source:
                'import { Expense } from "./CollectionSchema.js";\n\nexport default function getValue(expense: Expense): string {\n  return expense.title;\n}',
              compiled:
                "export default function getValue(expense) {\n    return expense.title;\n}\n",
            },
          },
        ],
      },
      migration: null,
      createdAt: new Date("2025-08-28T09:34:07.048Z"),
    },
    CollectionVersion_CSZt7rdynZLdoN6KQtVg3: {
      id: "CollectionVersion_CSZt7rdynZLdoN6KQtVg3",
      previousVersionId: null,
      collectionId: "Collection_CSZt7rdynZLdoJupfrJ9k",
      schema: {
        types: {
          NovaGroup: {
            description:
              "The Nova classification is a framework for grouping edible substances based on the extent and purpose of food processing applied to them.",
            dataType: DataType.Enum,
            members: {
              Unprocessed: {
                description:
                  "Group 1: Unprocessed or minimally processed foods. Unprocessed foods are the edible parts of plants, animals, algae and fungi along with water. Examples include fresh or frozen fruits and vegetables, grains, legumes, fresh meat, eggs, milk, plain yogurt, and crushed spices.",
                value: "Unprocessed",
              },
              CulinaryIngredient: {
                description:
                  "Group 2: Processed culinary ingredients. Processed culinary ingredients are derived from group 1 foods or else from nature by processes such as pressing, refining, grinding, milling, and drying. It also includes substances mined or extracted from nature. Examples include oils produced through crushing seeds, nuts, or fruits (such as olive oil), salt, sugar, vinegar, starches, honey, syrups extracted from trees, butter, and other substances used to season and cook.",
                value: "CulinaryIngredient",
              },
              Processed: {
                description:
                  "Group 3: Processed foods. Processed foods are relatively simple food products produced by adding processed culinary ingredients (group 2 substances) such as salt or sugar to unprocessed (group 1) foods. Examples include cheese, canned vegetables, salted nuts, fruits in syrup, and dried or canned fish. Breads, pastries, cakes, biscuits, snacks, and some meat products fall into this group when they are made predominantly from group 1 foods with the addition of group 2 ingredients.",
                value: "Processed",
              },
              UltraProcessed: {
                description:
                  "Group 4: Ultra-processed foods. Industrially manufactured food products made up of several ingredients (formulations) including sugar, oils, fats and salt (generally in combination and in higher amounts than in processed foods) and food substances of no or rare culinary use (such as high-fructose corn syrup, hydrogenated oils, modified starches and protein isolates). Examples incluse soft drinks, packaged snacks, instant noodles, reconstituted meat products, mass-produced breads, ice-cream, frozen ready-meals.",
                value: "UltraProcessed",
              },
            },
          },
          EnergyQuantity: {
            description: "A quantity of energy.",
            dataType: DataType.Struct,
            properties: {
              unit: {
                description: "Kilocalories.",
                dataType: DataType.StringLiteral,
                value: "kcal",
              },
              amount: {
                dataType: DataType.Number,
              },
            },
          },
          MassQuantity: {
            description: "A quantity of mass.",
            dataType: DataType.Struct,
            properties: {
              unit: {
                description: "Grams.",
                dataType: DataType.StringLiteral,
                value: "g",
              },
              amount: {
                dataType: DataType.Number,
              },
            },
          },
          Food: {
            description:
              "Any nourishing substance that is eaten, drunk, or otherwise taken into the body.",
            dataType: DataType.Struct,
            properties: {
              name: {
                dataType: DataType.String,
              },
              novaGroup: {
                dataType: null,
                ref: "NovaGroup",
              },
              servingSize: {
                description: "The amount to which nutrition facts refer to.",
                dataType: null,
                ref: "MassQuantity",
              },
              nutritionFacts: {
                dataType: DataType.Struct,
                properties: {
                  calories: {
                    dataType: null,
                    ref: "EnergyQuantity",
                  },
                  fat: {
                    dataType: null,
                    ref: "MassQuantity",
                  },
                  carbs: {
                    dataType: null,
                    ref: "MassQuantity",
                  },
                  protein: {
                    dataType: null,
                    ref: "MassQuantity",
                  },
                },
                nullableProperties: ["fat", "carbs", "protein"],
              },
            },
          },
        },
        rootType: "Food",
      },
      settings: {
        summaryProperties: [
          {
            name: "Name",
            description: "",
            getter: {
              source:
                'import { Food } from "./CollectionSchema.js";\n\nexport default function getValue(food: Food): string {\n  return food.name;\n}',
              compiled:
                "export default function getValue(food) {\n    return food.name;\n}\n",
            },
          },
          {
            name: "Nova Group",
            description: "",
            getter: {
              source:
                'import { Food } from "./CollectionSchema.js";\n\nexport default function getValue(food: Food): string {\n  return food.novaGroup;\n}',
              compiled:
                "export default function getValue(food) {\n    return food.novaGroup;\n}\n",
            },
          },
          {
            name: "Calories",
            description: "",
            getter: {
              source:
                'import { Food } from "./CollectionSchema.js";\n\nexport default function getValue(food: Food): string {\n  return food.nutritionFacts.calories.amount + " per " + food.servingSize.amount + "grams";\n}',
              compiled:
                'export default function getValue(food) {\n    return food.nutritionFacts.calories.amount + " per " + food.servingSize.amount + "grams";\n}\n',
            },
          },
        ],
      },
      migration: null,
      createdAt: new Date("2025-08-28T09:36:47.733Z"),
    },
    CollectionVersion_CSZtEQ9UDJsPHDVWR77h3: {
      id: "CollectionVersion_CSZtEQ9UDJsPHDVWR77h3",
      previousVersionId: null,
      collectionId: "Collection_CSZtEQ9UDJsPHB3KnXWKf",
      schema: {
        types: {
          Type: {
            dataType: DataType.Enum,
            members: {
              Breakfast: {
                value: "Breakfast",
              },
              MorningSnack: {
                value: "MorningSnack",
              },
              Lunch: {
                value: "Lunch",
              },
              AfternoonSnack: {
                value: "AfternoonSnack",
              },
              Dinner: {
                value: "Dinner",
              },
              EveningSnack: {
                value: "EveningSnack",
              },
            },
          },
          MassQuantity: {
            description: "A quantity of mass.",
            dataType: DataType.Struct,
            properties: {
              unit: {
                description: "Grams.",
                dataType: DataType.StringLiteral,
                value: "g",
              },
              amount: {
                dataType: DataType.Number,
              },
            },
          },
          Meal: {
            dataType: DataType.Struct,
            properties: {
              type: {
                dataType: null,
                ref: "Type",
              },
              date: {
                description: "The date of the meal.",
                dataType: DataType.String,
                format: "dev.superego:String.PlainDate",
              },
              consumedFoods: {
                description: "Foods consumed during the meal.",
                dataType: DataType.List,
                items: {
                  dataType: DataType.Struct,
                  properties: {
                    foodId: {
                      dataType: DataType.String,
                    },
                    quantity: {
                      dataType: null,
                      ref: "MassQuantity",
                    },
                  },
                },
              },
            },
          },
        },
        rootType: "Meal",
      },
      settings: {
        summaryProperties: [
          {
            name: "Title",
            description: "",
            getter: {
              source:
                'import { Meal } from "./CollectionSchema.js";\n\nexport default function getValue(meal: Meal): string {\n  return meal.date + " " + meal.type;\n}',
              compiled:
                'export default function getValue(meal) {\n    return meal.date + " " + meal.type;\n}\n',
            },
          },
        ],
      },
      migration: null,
      createdAt: new Date("2025-08-28T09:38:16.498Z"),
    },
    CollectionVersion_CSZtNQiv6xaohhjDbHcXT: {
      id: "CollectionVersion_CSZtNQiv6xaohhjDbHcXT",
      previousVersionId: null,
      collectionId: "Collection_CSZtNQiv6xaohffqQvPJR",
      schema: {
        types: {
          Type: {
            description: "Type of contact.",
            dataType: DataType.Enum,
            members: {
              Person: {
                description: "A single human.",
                value: "Person",
              },
              Organization: {
                description:
                  "A company, non-profit, government entity, group, etc.",
                value: "Organization",
              },
            },
          },
          Phone: {
            dataType: DataType.Struct,
            properties: {
              number: {
                description: "The actual phone number.",
                dataType: DataType.String,
              },
              description: {
                description:
                  "A description for the phone number. (Personal, work, etc.)",
                dataType: DataType.String,
              },
            },
            nullableProperties: ["description"],
          },
          Email: {
            dataType: DataType.Struct,
            properties: {
              address: {
                description: "The actual email address.",
                dataType: DataType.String,
              },
              description: {
                description:
                  "A description for the email address. (Personal, work, etc.)",
                dataType: DataType.String,
              },
            },
            nullableProperties: ["description"],
          },
          Contact: {
            description: "A contact in my address book.",
            dataType: DataType.Struct,
            properties: {
              type: {
                dataType: null,
                ref: "Type",
              },
              name: {
                description:
                  "Name of the contact. Either the full name for a person, or the organization name for an organization.",
                dataType: DataType.String,
              },
              relation: {
                description: "Who they are to me.",
                dataType: DataType.String,
              },
              phones: {
                description: "Their phone numbers",
                dataType: DataType.List,
                items: {
                  dataType: null,
                  ref: "Phone",
                },
              },
              emails: {
                description: "Their email addresses",
                dataType: DataType.List,
                items: {
                  dataType: null,
                  ref: "Email",
                },
              },
              notes: {
                description: "Misc notes about the contact",
                dataType: DataType.JsonObject,
                format: "dev.superego:JsonObject.TiptapRichText",
              },
            },
            nullableProperties: ["relation", "notes"],
          },
        },
        rootType: "Contact",
      },
      settings: {
        summaryProperties: [
          {
            name: "Name",
            description: "",
            getter: {
              source:
                'import { Contact } from "./CollectionSchema.js";\n\nexport default function getValue(contact: Contact): string {\n  return contact.name;\n}',
              compiled:
                "export default function getValue(contact) {\n    return contact.name;\n}\n",
            },
          },
          {
            name: "Type",
            description: "",
            getter: {
              source:
                'import { Contact } from "./CollectionSchema.js";\n\nexport default function getValue(contact: Contact): string {\n  return contact.type;\n}',
              compiled:
                "export default function getValue(contact) {\n    return contact.type;\n}\n",
            },
          },
          {
            name: "Phone",
            description: "",
            getter: {
              source:
                'import { Contact } from "./CollectionSchema.js";\n\nexport default function getValue(contact: Contact): string {\n  const [phone] = contact.phones;\n  return phone ? phone.number : "";\n}',
              compiled:
                'export default function getValue(contact) {\n    const [phone] = contact.phones;\n    return phone ? phone.number : "";\n}\n',
            },
          },
          {
            name: "Email",
            description: "",
            getter: {
              source:
                'import { Contact } from "./CollectionSchema.js";\n\nexport default function getValue(contact: Contact): string {\n  const [email] = contact.emails;\n  return email ? email.address : "";\n}',
              compiled:
                'export default function getValue(contact) {\n    const [email] = contact.emails;\n    return email ? email.address : "";\n}\n',
            },
          },
        ],
      },
      migration: null,
      createdAt: new Date("2025-08-28T09:40:05.159Z"),
    },
    CollectionVersion_CSZtXKVtjeB2xwFM1DxNN: {
      id: "CollectionVersion_CSZtXKVtjeB2xwFM1DxNN",
      previousVersionId: null,
      collectionId: "Collection_CSZtXKVtjeB2xspwyVsW4",
      schema: {
        types: {
          Pet: {
            description: "My pets.",
            dataType: DataType.Enum,
            members: {
              Galois: {
                description: "Cat.",
                value: "Galois",
              },
              Abel: {
                description: "Dog.",
                value: "Abel",
              },
            },
          },
          VetVisit: {
            description: "A visit to the vet.",
            dataType: DataType.Struct,
            properties: {
              pet: {
                description: "Which pet was brought.",
                dataType: null,
                ref: "Pet",
              },
              date: {
                description: "Date of the visit.",
                dataType: DataType.String,
                format: "dev.superego:String.PlainDate",
              },
              title: {
                description: "Short title for the visit. 5 words max.",
                dataType: DataType.String,
              },
              vet: {
                description: "Which vet the pet was brought to.",
                dataType: DataType.String,
              },
              notes: {
                description:
                  "Details about the visit. What the vet said, what they prescribed, etc.",
                dataType: DataType.JsonObject,
                format: "dev.superego:JsonObject.TiptapRichText",
              },
            },
            nullableProperties: ["notes"],
          },
        },
        rootType: "VetVisit",
      },
      settings: {
        summaryProperties: [
          {
            name: "Title",
            description: "",
            getter: {
              source:
                'import { VetVisit } from "./CollectionSchema.js";\n\nexport default function getValue(vetVisit: VetVisit): string {\n  return vetVisit.title;\n}',
              compiled:
                "export default function getValue(vetVisit) {\n    return vetVisit.title;\n}\n",
            },
          },
          {
            name: "Pet",
            description: "",
            getter: {
              source:
                'import { VetVisit } from "./CollectionSchema.js";\n\nexport default function getValue(vetVisit: VetVisit): string {\n  return vetVisit.pet;\n}',
              compiled:
                "export default function getValue(vetVisit) {\n    return vetVisit.pet;\n}\n",
            },
          },
          {
            name: "Date",
            description: "",
            getter: {
              source:
                'import { VetVisit } from "./CollectionSchema.js";\n\nexport default function getValue(vetVisit: VetVisit): string {\n  return vetVisit.date;\n}',
              compiled:
                "export default function getValue(vetVisit) {\n    return vetVisit.date;\n}\n",
            },
          },
        ],
      },
      migration: null,
      createdAt: new Date("2025-08-28T09:42:06.031Z"),
    },
    CollectionVersion_CSZtbatUAnJNea7ReLxEe: {
      id: "CollectionVersion_CSZtbatUAnJNea7ReLxEe",
      previousVersionId: null,
      collectionId: "Collection_CSZtbatUAnJNeXaxFJZgP",
      schema: {
        types: {
          WeighIn: {
            description: " A single weigh-in.",
            dataType: DataType.Struct,
            properties: {
              timestamp: {
                description: "When the weigh-in occurred.",
                dataType: DataType.String,
                format: "dev.superego:String.Instant",
              },
              weightKg: {
                description: "Weight in kilograms.",
                dataType: DataType.Number,
              },
              bodyFatPercentage: {
                description: "Body fat percentage.",
                dataType: DataType.Number,
              },
              muscleMassKg: {
                description: "Muscle mass in kilograms.",
                dataType: DataType.Number,
              },
              measurementDevice: {
                description: "Device used for measurement.",
                dataType: DataType.String,
              },
              notes: {
                dataType: DataType.String,
              },
            },
            nullableProperties: ["bodyFatPercentage", "muscleMassKg", "notes"],
          },
        },
        rootType: "WeighIn",
      },
      settings: {
        summaryProperties: [
          {
            name: "Summary",
            description: "Summary",
            getter: {
              source:
                'import { WeighIn } from "./CollectionSchema.js";\n\nexport default function getValue(weighIn: WeighIn): string {\n  return weighIn.timestamp.slice(0, 10) + " - " + weighIn.weightKg + " kg";\n}',
              compiled:
                'export default function getValue(weighIn) {\n    return weighIn.timestamp.slice(0, 10) + " - " + weighIn.weightKg + " kg";\n}\n',
            },
          },
        ],
      },
      migration: null,
      createdAt: new Date("2025-08-28T09:43:03.894Z"),
    },
  },
  documents: {
    Document_CSZzGaPNqnSChJU7LpD4j: {
      id: "Document_CSZzGaPNqnSChJU7LpD4j",
      collectionId: "Collection_CSZsv1e8QqfJTrALkYEWN",
      createdAt: new Date("2025-08-28T10:57:26.954Z"),
    },
    Document_CSZzMbaCct8BT2LdY5ERs: {
      id: "Document_CSZzMbaCct8BT2LdY5ERs",
      collectionId: "Collection_CSZsYNxB2S24GWXz8k95B",
      createdAt: new Date("2025-08-28T10:58:35.061Z"),
    },
    Document_CSZzrDWTYbZQSwxzDfygR: {
      id: "Document_CSZzrDWTYbZQSwxzDfygR",
      collectionId: "Collection_CSZtNQiv6xaohffqQvPJR",
      createdAt: new Date("2025-08-28T11:05:03.311Z"),
    },
    Document_CSZzzx2J9GrXndjSZfxAe: {
      id: "Document_CSZzzx2J9GrXndjSZfxAe",
      collectionId: "Collection_CSZtNQiv6xaohffqQvPJR",
      createdAt: new Date("2025-08-28T11:07:01.782Z"),
    },
    Document_CSa17UazLgxXvM4gsLPFP: {
      id: "Document_CSa17UazLgxXvM4gsLPFP",
      collectionId: "Collection_CSZtNQiv6xaohffqQvPJR",
      createdAt: new Date("2025-08-28T11:08:30.326Z"),
    },
    Document_CSa1KAcae3U6aZhb7Yi9N: {
      id: "Document_CSa1KAcae3U6aZhb7Yi9N",
      collectionId: "Collection_CSZtXKVtjeB2xspwyVsW4",
      createdAt: new Date("2025-08-28T11:11:08.912Z"),
    },
    Document_CSa1NbUPbYZiXjdfxqU7r: {
      id: "Document_CSa1NbUPbYZiXjdfxqU7r",
      collectionId: "Collection_CSZtbatUAnJNeXaxFJZgP",
      createdAt: new Date("2025-08-28T11:11:55.425Z"),
    },
  },
  documentVersions: {
    DocumentVersion_CSZzGaPcsAsAqzQ6vkQc8: {
      id: "DocumentVersion_CSZzGaPcsAsAqzQ6vkQc8",
      previousVersionId: null,
      documentId: "Document_CSZzGaPNqnSChJU7LpD4j",
      collectionId: "Collection_CSZsv1e8QqfJTrALkYEWN",
      collectionVersionId: "CollectionVersion_CSZsv1eNcGkM79wNhXHBz",
      content: {
        title: "Bathroom Scale",
        date: "2025-08-28",
        amount: 100,
        currency: "EUR",
        category: "ShoppingAndPersonalCare",
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
                  text: "Model: Garmin Index S2 Smart Scale",
                },
              ],
            },
          ],
        },
      },
      createdAt: new Date("2025-08-28T10:57:26.954Z"),
    },
    DocumentVersion_CSZzMbaCct8BT6Cspd5df: {
      id: "DocumentVersion_CSZzMbaCct8BT6Cspd5df",
      previousVersionId: null,
      documentId: "Document_CSZzMbaCct8BT2LdY5ERs",
      collectionId: "Collection_CSZsYNxB2S24GWXz8k95B",
      collectionVersionId: "CollectionVersion_CSZsYNxB2S24GXt3EhVC3",
      content: {
        vehicle: "Kia Sportage",
        timestamp: "2025-08-28T10:57:43.732Z",
        odometer: 121058,
        liters: 54.03,
        totalCost: 72.94,
        fullTank: true,
        pricePerLiter: 1.35,
        fuelType: "Gasoline 95",
        notes: {
          __dataType: DataType.JsonObject,
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: {
                textAlign: null,
              },
            },
          ],
        },
      },
      createdAt: new Date("2025-08-28T10:58:35.061Z"),
    },
    DocumentVersion_CSZzrDWTYbZQSy4sv4F9a: {
      id: "DocumentVersion_CSZzrDWTYbZQSy4sv4F9a",
      previousVersionId: null,
      documentId: "Document_CSZzrDWTYbZQSwxzDfygR",
      collectionId: "Collection_CSZtNQiv6xaohffqQvPJR",
      collectionVersionId: "CollectionVersion_CSZtNQiv6xaohhjDbHcXT",
      content: {
        type: "Person",
        name: "Pierre de Fermat",
        relation: "Pen pal",
        phones: [],
        emails: [
          {
            address: "an+bn=cn@fermat.fr",
            description: null,
          },
        ],
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
                  text: "Remember to always ask for proof.",
                },
              ],
            },
          ],
        },
      },
      createdAt: new Date("2025-08-28T11:05:03.311Z"),
    },
    DocumentVersion_CSZzzx2J9GrXnevnAi8hD: {
      id: "DocumentVersion_CSZzzx2J9GrXnevnAi8hD",
      previousVersionId: null,
      documentId: "Document_CSZzzx2J9GrXndjSZfxAe",
      collectionId: "Collection_CSZtNQiv6xaohffqQvPJR",
      collectionVersionId: "CollectionVersion_CSZtNQiv6xaohhjDbHcXT",
      content: {
        type: "Person",
        name: "Bernhard Riemann",
        relation: null,
        phones: [
          {
            number: "+1200000000000",
            description: null,
          },
        ],
        emails: [],
        notes: {
          __dataType: DataType.JsonObject,
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: {
                textAlign: null,
              },
            },
          ],
        },
      },
      createdAt: new Date("2025-08-28T11:07:01.782Z"),
    },
    DocumentVersion_CSa17UazLgxXvPsWjmw4r: {
      id: "DocumentVersion_CSa17UazLgxXvPsWjmw4r",
      previousVersionId: null,
      documentId: "Document_CSa17UazLgxXvM4gsLPFP",
      collectionId: "Collection_CSZtNQiv6xaohffqQvPJR",
      collectionVersionId: "CollectionVersion_CSZtNQiv6xaohhjDbHcXT",
      content: {
        type: "Organization",
        name: "Nicolas Bourbaki",
        relation: null,
        phones: [],
        emails: [],
        notes: {
          __dataType: DataType.JsonObject,
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: {
                textAlign: null,
              },
            },
          ],
        },
      },
      createdAt: new Date("2025-08-28T11:08:30.326Z"),
    },
    DocumentVersion_CSa1KAcae3U6acXDzLZ3P: {
      id: "DocumentVersion_CSa1KAcae3U6acXDzLZ3P",
      previousVersionId: null,
      documentId: "Document_CSa1KAcae3U6aZhb7Yi9N",
      collectionId: "Collection_CSZtXKVtjeB2xspwyVsW4",
      collectionVersionId: "CollectionVersion_CSZtXKVtjeB2xwFM1DxNN",
      content: {
        pet: "Abel",
        date: "2025-08-27",
        title: "Rabies shot",
        vet: "Eglė - Animal Eden",
        notes: {
          __dataType: DataType.JsonObject,
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: {
                textAlign: null,
              },
            },
          ],
        },
      },
      createdAt: new Date("2025-08-28T11:11:08.912Z"),
    },
    DocumentVersion_CSa1NbUPbYZiXmcAQVMqJ: {
      id: "DocumentVersion_CSa1NbUPbYZiXmcAQVMqJ",
      previousVersionId: null,
      documentId: "Document_CSa1NbUPbYZiXjdfxqU7r",
      collectionId: "Collection_CSZtbatUAnJNeXaxFJZgP",
      collectionVersionId: "CollectionVersion_CSZtbatUAnJNea7ReLxEe",
      content: {
        timestamp: "2025-08-28T11:11:22.228Z",
        weightKg: 69.5,
        bodyFatPercentage: null,
        muscleMassKg: null,
        measurementDevice: "Garmin Index S2",
        notes: null,
      },
      createdAt: new Date("2025-08-28T11:11:55.425Z"),
    },
  },
} satisfies Partial<Data>;
