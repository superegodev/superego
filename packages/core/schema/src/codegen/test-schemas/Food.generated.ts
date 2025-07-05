//////////////////
// Schema types //
//////////////////

/**
 * The Nova classification is a framework for grouping edible substances based on the extent and purpose of food processing applied to them.
 * Nova classifies food into four groups.
 */
export enum NovaGroup {
  /**
   * #### Group 1: Unprocessed or minimally processed foods
   * Unprocessed foods are the edible parts of plants, animals, algae and fungi along with water.
   * Examples include fresh or frozen fruits and vegetables, grains, legumes, fresh meat, eggs, milk, plain yogurt, and crushed spices.
   */
  Unprocessed = "Unprocessed",
  /**
   * #### Group 2: Processed culinary ingredients
   * Processed culinary ingredients are derived from group 1 foods or else from nature by processes such as pressing, refining, grinding, milling, and drying. It also includes substances mined or extracted from nature.
   * Examples include oils produced through crushing seeds, nuts, or fruits (such as olive oil), salt, sugar, vinegar, starches, honey, syrups extracted from trees, butter, and other substances used to season and cook.
   */
  CulinaryIngredient = "CulinaryIngredient",
  /**
   * #### Group 3: Processed foods
   * Processed foods are relatively simple food products produced by adding processed culinary ingredients (group 2 substances) such as salt or sugar to unprocessed (group 1) foods.
   * Examples include cheese, canned vegetables, salted nuts, fruits in syrup, and dried or canned fish. Breads, pastries, cakes, biscuits, snacks, and some meat products fall into this group when they are made predominantly from group 1 foods with the addition of group 2 ingredients.
   */
  Processed = "Processed",
  /**
   * #### Group 4: Ultra-processed foods
   * Industrially manufactured food products made up of several ingredients (formulations) including sugar, oils, fats and salt (generally in combination and in higher amounts than in processed foods) and food substances of no or rare culinary use (such as high-fructose corn syrup, hydrogenated oils, modified starches and protein isolates).
   * Examples incluse soft drinks, packaged snacks, instant noodles, reconstituted meat products, mass-produced breads, ice-cream, frozen ready-meals.
   */
  UltraProcessed = "UltraProcessed",
}

/**
 * A quantity of energy.
 */
export type EnergyQuantity = {
  /**
   * Kilocalories.
   */
  unit: "kcal";
  amount: number;
};

/**
 * A quantity of mass.
 */
export type MassQuantity = {
  /**
   * Grams.
   */
  unit: "g";
  amount: number;
};

/**
 * Any nourishing substance that is eaten, drunk, or otherwise taken into the body.
 */
export type Food = {
  name: string;
  novaGroup: NovaGroup;
  /**
   * The amount to which nutrition facts refer to.
   */
  servingSize: MassQuantity;
  nutritionFacts: {
    calories: EnergyQuantity;
    fat: MassQuantity | null;
    carbs: MassQuantity | null;
    protein: MassQuantity | null;
  };
};
