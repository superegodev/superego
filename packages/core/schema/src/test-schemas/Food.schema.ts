import DataType from "../DataType.js";
import type Schema from "../Schema.js";

export default {
  types: {
    NovaGroup: {
      description: {
        en: [
          "The Nova classification is a framework for grouping edible substances based on the extent and purpose of food processing applied to them.",
          "Nova classifies food into four groups.",
        ].join("\n"),
      },
      dataType: DataType.Enum,
      members: {
        Unprocessed: {
          description: {
            en: [
              "#### Group 1: Unprocessed or minimally processed foods",
              "Unprocessed foods are the edible parts of plants, animals, algae and fungi along with water.",
              "Examples include fresh or frozen fruits and vegetables, grains, legumes, fresh meat, eggs, milk, plain yogurt, and crushed spices.",
            ].join("\n"),
          },
          value: "Unprocessed",
        },
        CulinaryIngredient: {
          description: {
            en: [
              "#### Group 2: Processed culinary ingredients",
              "Processed culinary ingredients are derived from group 1 foods or else from nature by processes such as pressing, refining, grinding, milling, and drying. It also includes substances mined or extracted from nature.",
              "Examples include oils produced through crushing seeds, nuts, or fruits (such as olive oil), salt, sugar, vinegar, starches, honey, syrups extracted from trees, butter, and other substances used to season and cook.",
            ].join("\n"),
          },
          value: "CulinaryIngredient",
        },
        Processed: {
          description: {
            en: [
              "#### Group 3: Processed foods",
              "Processed foods are relatively simple food products produced by adding processed culinary ingredients (group 2 substances) such as salt or sugar to unprocessed (group 1) foods.",
              "Examples include cheese, canned vegetables, salted nuts, fruits in syrup, and dried or canned fish. Breads, pastries, cakes, biscuits, snacks, and some meat products fall into this group when they are made predominantly from group 1 foods with the addition of group 2 ingredients.",
            ].join("\n"),
          },
          value: "Processed",
        },
        UltraProcessed: {
          description: {
            en: [
              "#### Group 4: Ultra-processed foods",
              "Industrially manufactured food products made up of several ingredients (formulations) including sugar, oils, fats and salt (generally in combination and in higher amounts than in processed foods) and food substances of no or rare culinary use (such as high-fructose corn syrup, hydrogenated oils, modified starches and protein isolates).",
              "Examples incluse soft drinks, packaged snacks, instant noodles, reconstituted meat products, mass-produced breads, ice-cream, frozen ready-meals.",
            ].join("\n"),
          },
          value: "UltraProcessed",
        },
      },
    },
    EnergyQuantity: {
      description: { en: "A quantity of energy." },
      dataType: DataType.Struct,
      properties: {
        unit: {
          description: { en: "Kilocalories." },
          dataType: DataType.StringLiteral,
          value: "kcal",
        },
        amount: { dataType: DataType.Number },
      },
    },
    MassQuantity: {
      description: { en: "A quantity of mass." },
      dataType: DataType.Struct,
      properties: {
        unit: {
          description: { en: "Grams." },
          dataType: DataType.StringLiteral,
          value: "g",
        },
        amount: { dataType: DataType.Number },
      },
    },
    Food: {
      description: {
        en: "Any nourishing substance that is eaten, drunk, or otherwise taken into the body.",
      },
      dataType: DataType.Struct,
      properties: {
        name: { dataType: DataType.String },
        novaGroup: {
          dataType: null,
          ref: "NovaGroup",
        },
        servingSize: {
          description: {
            en: "The amount to which nutrition facts refer to.",
          },
          dataType: null,
          ref: "MassQuantity",
        },
        nutritionFacts: {
          dataType: DataType.Struct,
          properties: {
            calories: { dataType: null, ref: "EnergyQuantity" },
            fat: { dataType: null, ref: "MassQuantity" },
            carbs: { dataType: null, ref: "MassQuantity" },
            protein: { dataType: null, ref: "MassQuantity" },
          },
          nullableProperties: ["fat", "carbs", "protein"],
        },
      },
    },
  },
  rootType: "Food",
} satisfies Schema;
