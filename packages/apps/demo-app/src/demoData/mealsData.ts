import type { packsAsConst } from "@superego/bazaar";
import type { TypeOf } from "@superego/schema";
import { DateTime } from "luxon";

type Meal = TypeOf<(typeof packsAsConst)[1]["collections"][2]["schema"]>;

const g = (amount: number) => ({ unit: "g" as const, amount });

// Helper to create a meal item with a ProtoDocument reference. The collectionId
// uses ProtoCollection_0 which will be resolved to the actual foods collection
// ID when collections are created with createMany. The documentId uses
// ProtoDocument_<index> which will be resolved to the actual food document ID
// when meals documents are created.
const mealItem = (foodDocumentIndex: number, grams: number) => ({
  food: {
    collectionId: "ProtoCollection_1",
    documentId: `ProtoDocument_${foodDocumentIndex}`,
  },
  quantity: g(grams),
});

export default [
  // Day 7 (7 days ago)
  {
    type: "Breakfast",
    dateTime: DateTime.now()
      .minus({ days: 7 })
      .set({ hour: 7, minute: 30, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(27, 200), // Oatmeal 200g
      mealItem(1, 120), // Banana 120g
      mealItem(43, 15), // Honey 15g
      mealItem(10, 150), // Whole Milk 150g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Lunch",
    dateTime: DateTime.now()
      .minus({ days: 7 })
      .set({ hour: 12, minute: 30, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(15, 150), // Chicken Breast 150g
      mealItem(24, 150), // Brown Rice 150g
      mealItem(5, 100), // Broccoli 100g
      mealItem(40, 15), // Olive Oil 15g
    ],
    tags: ["Work"],
    notes: null,
  },
  {
    type: "Dinner",
    dateTime: DateTime.now()
      .minus({ days: 7 })
      .set({ hour: 19, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(16, 200), // Ground Beef 200g
      mealItem(9, 200), // Potato 200g
      mealItem(6, 100), // Carrot 100g
      mealItem(12, 30), // Cheddar Cheese 30g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Snack",
    dateTime: DateTime.now()
      .minus({ days: 7 })
      .set({ hour: 15, minute: 30, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(0, 150), // Apple 150g
      mealItem(42, 30), // Peanut Butter 30g
    ],
    tags: ["Work"],
    notes: null,
  },

  // Day 6 (6 days ago)
  {
    type: "Breakfast",
    dateTime: DateTime.now()
      .minus({ days: 6 })
      .set({ hour: 8, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(13, 100), // Eggs 100g (2 eggs)
      mealItem(19, 50), // Bacon 50g
      mealItem(26, 60), // Whole Wheat Bread 60g
      mealItem(38, 200), // Coffee 200g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Lunch",
    dateTime: DateTime.now()
      .minus({ days: 6 })
      .set({ hour: 13, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(20, 150), // Salmon 150g
      mealItem(28, 150), // Quinoa 150g
      mealItem(7, 80), // Spinach 80g
      mealItem(8, 100), // Tomato 100g
    ],
    tags: ["Restaurant"],
    notes: null,
  },
  {
    type: "Dinner",
    dateTime: DateTime.now()
      .minus({ days: 6 })
      .set({ hour: 20, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(29, 150), // Tofu 150g
      mealItem(23, 150), // White Rice 150g
      mealItem(5, 120), // Broccoli 120g
      mealItem(6, 80), // Carrot 80g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Snack",
    dateTime: DateTime.now()
      .minus({ days: 6 })
      .set({ hour: 16, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(49, 50), // Popcorn 50g
    ],
    tags: ["Home"],
    notes: null,
  },

  // Day 5 (5 days ago)
  {
    type: "Breakfast",
    dateTime: DateTime.now()
      .minus({ days: 5 })
      .set({ hour: 7, minute: 15, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(11, 150), // Greek Yogurt 150g
      mealItem(3, 100), // Strawberries 100g
      mealItem(33, 30), // Almonds 30g
      mealItem(43, 10), // Honey 10g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Lunch",
    dateTime: DateTime.now()
      .minus({ days: 5 })
      .set({ hour: 12, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(21, 100), // Tuna 100g
      mealItem(25, 200), // Pasta 200g
      mealItem(8, 80), // Tomato 80g
      mealItem(40, 10), // Olive Oil 10g
    ],
    tags: ["Work"],
    notes: null,
  },
  {
    type: "Dinner",
    dateTime: DateTime.now()
      .minus({ days: 5 })
      .set({ hour: 19, minute: 30, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(51, 250), // Frozen Pizza 250g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Snack",
    dateTime: DateTime.now()
      .minus({ days: 5 })
      .set({ hour: 10, minute: 30, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(1, 120), // Banana 120g
      mealItem(34, 20), // Walnuts 20g
    ],
    tags: ["Work"],
    notes: null,
  },

  // Day 4 (4 days ago)
  {
    type: "Breakfast",
    dateTime: DateTime.now()
      .minus({ days: 4 })
      .set({ hour: 8, minute: 30, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(52, 30), // Whey Protein 30g
      mealItem(10, 250), // Whole Milk 250g
      mealItem(1, 100), // Banana 100g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Lunch",
    dateTime: DateTime.now()
      .minus({ days: 4 })
      .set({ hour: 13, minute: 30, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(50, 300), // Chicken Soup 300g
      mealItem(26, 80), // Whole Wheat Bread 80g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Dinner",
    dateTime: DateTime.now()
      .minus({ days: 4 })
      .set({ hour: 20, minute: 30, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(22, 200), // Shrimp 200g
      mealItem(25, 180), // Pasta 180g
      mealItem(53, 10), // Garlic 10g
      mealItem(40, 20), // Olive Oil 20g
      mealItem(8, 100), // Tomato 100g
    ],
    tags: ["Home", "Social"],
    notes: null,
  },
  {
    type: "Snack",
    dateTime: DateTime.now()
      .minus({ days: 4 })
      .set({ hour: 22, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(46, 50), // Dark Chocolate 50g
      mealItem(39, 200), // Green Tea 200g
    ],
    tags: ["Home"],
    notes: null,
  },

  // Day 3 (3 days ago)
  {
    type: "Breakfast",
    dateTime: DateTime.now()
      .minus({ days: 3 })
      .set({ hour: 9, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(13, 150), // Eggs 150g (3 eggs)
      mealItem(7, 50), // Spinach 50g
      mealItem(12, 40), // Cheddar Cheese 40g
      mealItem(37, 200), // Orange Juice 200g
    ],
    tags: ["Home", "Social"],
    notes: null,
  },
  {
    type: "Lunch",
    dateTime: DateTime.now()
      .minus({ days: 3 })
      .set({ hour: 14, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(17, 180), // Pork Chop 180g
      mealItem(9, 200), // Potato 200g
      mealItem(5, 100), // Broccoli 100g
    ],
    tags: ["Restaurant"],
    notes: null,
  },
  {
    type: "Dinner",
    dateTime: DateTime.now()
      .minus({ days: 3 })
      .set({ hour: 19, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(31, 200), // Lentils 200g
      mealItem(24, 150), // Brown Rice 150g
      mealItem(7, 100), // Spinach 100g
      mealItem(8, 80), // Tomato 80g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Snack",
    dateTime: DateTime.now()
      .minus({ days: 3 })
      .set({ hour: 16, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(4, 150), // Grapes 150g
      mealItem(12, 30), // Cheddar Cheese 30g
    ],
    tags: ["Home"],
    notes: null,
  },

  // Day 2 (2 days ago)
  {
    type: "Breakfast",
    dateTime: DateTime.now()
      .minus({ days: 2 })
      .set({ hour: 7, minute: 45, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(27, 180), // Oatmeal 180g
      mealItem(2, 100), // Blueberries 100g
      mealItem(43, 15), // Honey 15g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Lunch",
    dateTime: DateTime.now()
      .minus({ days: 2 })
      .set({ hour: 12, minute: 30, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(15, 180), // Chicken Breast 180g
      mealItem(28, 150), // Quinoa 150g
      mealItem(7, 100), // Spinach 100g
    ],
    tags: ["Work"],
    notes: null,
  },
  {
    type: "Dinner",
    dateTime: DateTime.now()
      .minus({ days: 2 })
      .set({ hour: 19, minute: 30, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(20, 200), // Salmon 200g
      mealItem(9, 180), // Potato 180g
      mealItem(5, 120), // Broccoli 120g
      mealItem(40, 15), // Olive Oil 15g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Snack",
    dateTime: DateTime.now()
      .minus({ days: 2 })
      .set({ hour: 15, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(11, 150), // Greek Yogurt 150g
      mealItem(33, 25), // Almonds 25g
    ],
    tags: ["Work"],
    notes: null,
  },

  // Day 1 (yesterday)
  {
    type: "Breakfast",
    dateTime: DateTime.now()
      .minus({ days: 1 })
      .set({ hour: 8, minute: 15, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(13, 100), // Eggs 100g (2 eggs)
      mealItem(26, 60), // Whole Wheat Bread 60g
      mealItem(14, 30), // Butter 30g
      mealItem(38, 200), // Coffee 200g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Lunch",
    dateTime: DateTime.now()
      .minus({ days: 1 })
      .set({ hour: 13, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(21, 120), // Tuna 120g
      mealItem(23, 180), // White Rice 180g
      mealItem(8, 100), // Tomato 100g
      mealItem(7, 80), // Spinach 80g
    ],
    tags: ["Work"],
    notes: null,
  },
  {
    type: "Dinner",
    dateTime: DateTime.now()
      .minus({ days: 1 })
      .set({ hour: 20, minute: 0, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(16, 180), // Ground Beef 180g
      mealItem(25, 200), // Pasta 200g
      mealItem(8, 120), // Tomato 120g
      mealItem(53, 10), // Garlic 10g
    ],
    tags: ["Home"],
    notes: null,
  },
  {
    type: "Snack",
    dateTime: DateTime.now()
      .minus({ days: 1 })
      .set({ hour: 16, minute: 30, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(0, 180), // Apple 180g
      mealItem(42, 25), // Peanut Butter 25g
    ],
    tags: ["Home"],
    notes: null,
  },

  // Day 0 (today)
  {
    type: "Breakfast",
    dateTime: DateTime.now()
      .set({ hour: 7, minute: 30, second: 0, millisecond: 0 })
      .toISO(),
    foods: [
      mealItem(11, 200), // Greek Yogurt 200g
      mealItem(1, 120), // Banana 120g
      mealItem(34, 30), // Walnuts 30g
      mealItem(43, 10), // Honey 10g
    ],
    tags: ["Home"],
    notes: null,
  },
] satisfies Meal[];
