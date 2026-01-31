import foodsData from "./foodsData.js";
import foodsSchema from "./foodsSchema.js";
import type { DemoCollection } from "./types.js";

export default {
  categoryName: "Diet",
  settings: {
    name: "Foods",
    icon: "🍎",
    description: null,
    assistantInstructions: `
Use 100g as serving size if not specified.
    `.trim(),
  },
  schema: foodsSchema,
  versionSettings: {
    contentBlockingKeysGetter: {
      source: `
import type { Food } from "./CollectionSchema.js";

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/\\s+/g, " ")
    .trim();
}

export default function getContentBlockingKeys(food: Food): string[] {
  return [
    \`name:\${normalizeName(food.name)}\`,
  ];
}
      `.trim(),
      compiled: `
function normalizeName(name) {
  return name
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/\\s+/g, " ")
    .trim();
}

export default function getContentBlockingKeys(food) {
  return [
    \`name:\${normalizeName(food.name)}\`,
  ];
}
      `.trim(),
    },
    contentSummaryGetter: {
      source: `
import type { Food } from "./CollectionSchema.js";

export default function getContentSummary(
  food: Food,
): Record<string, string | boolean | null> {
  return {
    "{position:0,sortable:true,default-sort:asc} Name": food.name,
    "{position:1,sortable:true} Category": food.category,
    "{position:2,sortable:true} Calories": food.foodFacts.calories
      ? \`\${food.foodFacts.calories.amount} kcal\`
      : null,
    "{position:3,sortable:true} Protein": food.foodFacts.protein
      ? \`\${food.foodFacts.protein.amount} g\`
      : null,
    "{position:4,sortable:true} Carbs": food.foodFacts.totalCarbohydrate
      ? \`\${food.foodFacts.totalCarbohydrate.amount} g\`
      : null,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(food) {
  return {
    "{position:0,sortable:true,default-sort:asc} Name": food.name,
    "{position:1,sortable:true} Category": food.category,
    "{position:2,sortable:true} Calories": food.foodFacts.calories
      ? \`\${food.foodFacts.calories.amount} kcal\`
      : null,
    "{position:3,sortable:true} Protein": food.foodFacts.protein
      ? \`\${food.foodFacts.protein.amount} g\`
      : null,
    "{position:4,sortable:true} Carbs": food.foodFacts.totalCarbohydrate
      ? \`\${food.foodFacts.totalCarbohydrate.amount} g\`
      : null,
  };
}
      `.trim(),
    },
  },
  documents: foodsData,
} satisfies DemoCollection;
