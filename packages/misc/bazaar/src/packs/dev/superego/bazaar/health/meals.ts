import type { CollectionDefinition } from "@superego/backend";
import mealsSchema from "./mealsSchema.js";

export default {
  settings: {
    name: "Meals",
    icon: "🍽️",
    description: null,
    assistantInstructions: `
Track meals by selecting foods from the Foods collection.
Default serving sizes come from the Foods collection if not specified.
    `.trim(),
    collectionCategoryId: "ProtoCollectionCategory_0",
    defaultCollectionViewAppId: null,
  },
  schema: mealsSchema,
  versionSettings: {
    defaultDocumentLayoutOptions: null,
    contentBlockingKeysGetter: null,
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
} as const satisfies CollectionDefinition<true, true>;
