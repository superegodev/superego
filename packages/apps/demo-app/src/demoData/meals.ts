import mealsData from "./mealsData.js";
import mealsSchema from "./mealsSchema.js";
import type { DemoCollection } from "./types.js";

export default {
  categoryName: "Diet",
  settings: {
    name: "Meals",
    icon: "🍽️",
    description: null,
    assistantInstructions: `
Track meals by selecting foods from the Foods collection.
Default serving sizes come from the Foods collection if not specified.
    `.trim(),
  },
  schema: mealsSchema,
  versionSettings: {
    contentSummaryGetter: {
      source: `
import type { Meal } from "./CollectionSchema.js";

export default function getContentSummary(
  meal: Meal,
): Record<string, string | boolean | null> {
  const foodCount = meal.foods.length;
  const tagList = meal.tags.length > 0 ? meal.tags.join(", ") : null;
  return {
    "{position:0,sortable:true,default-sort:desc} Date": meal.dateTime,
    "{position:1,sortable:true} Type": meal.type,
    "{position:2} Foods": \`\${foodCount} item\${foodCount !== 1 ? "s" : ""}\`,
    "{position:3} Tags": tagList,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(meal) {
  const foodCount = meal.foods.length;
  const tagList = meal.tags.length > 0 ? meal.tags.join(", ") : null;
  return {
    "{position:0,sortable:true,default-sort:desc} Date": meal.dateTime,
    "{position:1,sortable:true} Type": meal.type,
    "{position:2} Foods": \`\${foodCount} item\${foodCount !== 1 ? "s" : ""}\`,
    "{position:3} Tags": tagList,
  };
}
      `.trim(),
    },
  },
  contentBlockingKeysGetter: null,
  documents: mealsData,
} satisfies DemoCollection;
