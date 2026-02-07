import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    MealType: {
      description: "Type of meal",
      dataType: DataType.Enum,
      members: {
        Breakfast: {
          value: "Breakfast",
        },
        Lunch: {
          value: "Lunch",
        },
        Dinner: {
          value: "Dinner",
        },
        Snack: {
          value: "Snack",
        },
      },
      membersOrder: ["Breakfast", "Lunch", "Dinner", "Snack"],
    },
    MealTag: {
      description: "Tag for categorizing meals by location or context",
      dataType: DataType.Enum,
      members: {
        Home: {
          description: "Meal prepared and eaten at home",
          value: "Home",
        },
        Restaurant: {
          description: "Meal eaten at a restaurant",
          value: "Restaurant",
        },
        Work: {
          description: "Meal eaten at work or office",
          value: "Work",
        },
        Takeout: {
          description: "Takeout or delivery meal",
          value: "Takeout",
        },
        Social: {
          description: "Meal with friends or family gathering",
          value: "Social",
        },
        Travel: {
          description: "Meal while traveling",
          value: "Travel",
        },
      },
      membersOrder: [
        "Home",
        "Restaurant",
        "Work",
        "Takeout",
        "Social",
        "Travel",
      ],
    },
    GramsQuantity: {
      description: "A quantity of mass in grams",
      dataType: DataType.Struct,
      properties: {
        unit: {
          description: "Grams",
          dataType: DataType.StringLiteral,
          value: "g",
        },
        amount: { dataType: DataType.Number },
      },
    },
    MealItem: {
      description: "A food consumed in a meal",
      dataType: DataType.Struct,
      properties: {
        food: {
          description: "Reference to a food document",
          dataType: DataType.DocumentRef,
          collectionId: "ProtoCollection_0",
        },
        quantity: {
          description: "Amount of the food consumed",
          dataType: null,
          ref: "GramsQuantity",
        },
      },
      propertiesOrder: ["food", "quantity"],
    },
    Meal: {
      description: "A meal with foods consumed",
      dataType: DataType.Struct,
      properties: {
        type: {
          dataType: null,
          ref: "MealType",
        },
        dateTime: {
          description: "When the meal was consumed",
          dataType: DataType.String,
          format: "dev.superego:String.Instant",
        },
        foods: {
          description: "Foods consumed in this meal",
          dataType: DataType.List,
          items: {
            dataType: null,
            ref: "MealItem",
          },
        },
        tags: {
          description: "Tags for categorizing the meal",
          dataType: DataType.List,
          items: {
            dataType: null,
            ref: "MealTag",
          },
        },
        notes: {
          description: "Additional notes about the meal",
          dataType: DataType.JsonObject,
          format: "dev.superego:JsonObject.TiptapRichText",
        },
      },
      nullableProperties: ["notes"],
      propertiesOrder: ["type", "dateTime", "foods", "tags", "notes"],
    },
  },
  rootType: "Meal",
} as const satisfies Schema;
