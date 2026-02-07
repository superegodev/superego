import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    KcalsQuantity: {
      description: "A quantity of energy in kilocalories",
      dataType: DataType.Struct,
      properties: {
        unit: {
          description: "Kilocalories",
          dataType: DataType.StringLiteral,
          value: "kcal",
        },
        amount: { dataType: DataType.Number },
      },
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
    MilligramsQuantity: {
      description: "A quantity of mass in milligrams",
      dataType: DataType.Struct,
      properties: {
        unit: {
          description: "Milligrams",
          dataType: DataType.StringLiteral,
          value: "mg",
        },
        amount: { dataType: DataType.Number },
      },
    },
    FoodCategory: {
      description: "Category of food item",
      dataType: DataType.Enum,
      members: {
        Beverages: {
          description: "Water, soft drink, juice, coffee/tea, energy drink",
          value: "Beverages",
        },
        DairyAndEggs: {
          description: "Milk, yogurt, cheese, eggs",
          value: "DairyAndEggs",
        },
        MeatAndPoultry: {
          value: "MeatAndPoultry",
        },
        FishAndSeafood: {
          value: "FishAndSeafood",
        },
        PlantProteins: {
          description: "Tofu/tempeh, legumes, meat alternatives",
          value: "PlantProteins",
        },
        Fruits: {
          value: "Fruits",
        },
        Vegetables: {
          value: "Vegetables",
        },
        GrainsAndStarches: {
          description: "Rice, pasta, bread, cereal, oats",
          value: "GrainsAndStarches",
        },
        BakeryAndDesserts: {
          value: "BakeryAndDesserts",
        },
        Snacks: {
          description: "Chips, crackers, popcorn",
          value: "Snacks",
        },
        NutsSeedsAndDriedFruit: {
          value: "NutsSeedsAndDriedFruit",
        },
        FatsAndOils: {
          description: "Oil, butter/ghee, margarine",
          value: "FatsAndOils",
        },
        CondimentsSaucesAndSpreads: {
          description: "Ketchup, mayo, peanut butter, jam",
          value: "CondimentsSaucesAndSpreads",
        },
        SoupsStewsAndBroths: {
          value: "SoupsStewsAndBroths",
        },
        PreparedReadyMeals: {
          description: "Frozen meals, meal kits, takeout-style",
          value: "PreparedReadyMeals",
        },
        BabyInfantFoods: {
          value: "BabyInfantFoods",
        },
        SportsMealReplacementProducts: {
          description: "Protein powder, bars, shakes",
          value: "SportsMealReplacementProducts",
        },
        HerbsSpicesAndSeasonings: {
          value: "HerbsSpicesAndSeasonings",
        },
        Sweeteners: {
          description: "Sugar, honey, syrups, artificial sweeteners",
          value: "Sweeteners",
        },
      },
    },
    FoodFacts: {
      description: "Nutritional information per 100g serving",
      dataType: DataType.Struct,
      properties: {
        calories: {
          description: "Energy content",
          dataType: null,
          ref: "KcalsQuantity",
        },
        protein: {
          description: "Protein content",
          dataType: null,
          ref: "GramsQuantity",
        },
        totalCarbohydrate: {
          description: "Total carbohydrates",
          dataType: null,
          ref: "GramsQuantity",
        },
        dietaryFiber: {
          description: "Dietary fiber",
          dataType: null,
          ref: "GramsQuantity",
        },
        totalSugars: {
          description: "Total sugars",
          dataType: null,
          ref: "GramsQuantity",
        },
        totalFat: {
          description: "Total fat",
          dataType: null,
          ref: "GramsQuantity",
        },
        saturatedFat: {
          description: "Saturated fat",
          dataType: null,
          ref: "GramsQuantity",
        },
        cholesterol: {
          description: "Cholesterol",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        caffeine: {
          description: "Caffeine content",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        alcohol: {
          description: "Alcohol content",
          dataType: null,
          ref: "GramsQuantity",
        },
        vitaminA: {
          description: "Vitamin A",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        vitaminC: {
          description: "Vitamin C",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        vitaminD: {
          description: "Vitamin D",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        vitaminE: {
          description: "Vitamin E",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        vitaminK: {
          description: "Vitamin K",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        vitaminB1: {
          description: "Vitamin B1 (Thiamine)",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        vitaminB2: {
          description: "Vitamin B2 (Riboflavin)",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        vitaminB3: {
          description: "Vitamin B3 (Niacin)",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        vitaminB6: {
          description: "Vitamin B6",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        folate: {
          description: "Folate (Vitamin B9)",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        vitaminB12: {
          description: "Vitamin B12",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        calcium: {
          description: "Calcium",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        iron: {
          description: "Iron",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        magnesium: {
          description: "Magnesium",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        phosphorus: {
          description: "Phosphorus",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        potassium: {
          description: "Potassium",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        sodium: {
          description: "Sodium",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        zinc: {
          description: "Zinc",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        selenium: {
          description: "Selenium",
          dataType: null,
          ref: "MilligramsQuantity",
        },
        iodine: {
          description: "Iodine",
          dataType: null,
          ref: "MilligramsQuantity",
        },
      },
      nullableProperties: [
        "calories",
        "protein",
        "totalCarbohydrate",
        "dietaryFiber",
        "totalSugars",
        "totalFat",
        "saturatedFat",
        "cholesterol",
        "caffeine",
        "alcohol",
        "vitaminA",
        "vitaminC",
        "vitaminD",
        "vitaminE",
        "vitaminK",
        "vitaminB1",
        "vitaminB2",
        "vitaminB3",
        "vitaminB6",
        "folate",
        "vitaminB12",
        "calcium",
        "iron",
        "magnesium",
        "phosphorus",
        "potassium",
        "sodium",
        "zinc",
        "selenium",
        "iodine",
      ],
      propertiesOrder: [
        "calories",
        "protein",
        "totalCarbohydrate",
        "dietaryFiber",
        "totalSugars",
        "totalFat",
        "saturatedFat",
        "cholesterol",
        "caffeine",
        "alcohol",
        "vitaminA",
        "vitaminC",
        "vitaminD",
        "vitaminE",
        "vitaminK",
        "vitaminB1",
        "vitaminB2",
        "vitaminB3",
        "vitaminB6",
        "folate",
        "vitaminB12",
        "calcium",
        "iron",
        "magnesium",
        "phosphorus",
        "potassium",
        "sodium",
        "zinc",
        "selenium",
        "iodine",
      ],
    },
    Food: {
      description: "A food item with standardized nutritional information",
      dataType: DataType.Struct,
      properties: {
        name: {
          description: "Name of the food item",
          dataType: DataType.String,
        },
        category: {
          description: "Category of the food item",
          dataType: null,
          ref: "FoodCategory",
        },
        servingSize: {
          description: "Standard serving size",
          dataType: null,
          ref: "GramsQuantity",
        },
        foodFacts: {
          description: "Nutritional information per serving",
          dataType: null,
          ref: "FoodFacts",
        },
        pictures: {
          description: "Pictures of the food item",
          dataType: DataType.List,
          items: {
            dataType: DataType.File,
            accept: { "image/*": "*" },
          },
        },
      },
      propertiesOrder: [
        "name",
        "category",
        "servingSize",
        "foodFacts",
        "pictures",
      ],
    },
  },
  rootType: "Food",
} as const satisfies Schema;
