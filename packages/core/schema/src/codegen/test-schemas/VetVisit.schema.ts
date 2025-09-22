import DataType from "../../DataType.js";
import FormatId from "../../formats/FormatId.js";
import type Schema from "../../Schema.js";

export default {
  types: {
    Pet: {
      description: "My pets.",
      dataType: DataType.Enum,
      members: {
        Galois: {
          value: "Galois",
          description: "Cat.",
        },
        Abel: {
          value: "Abel",
          description: "Dog.",
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
          format: FormatId.String.PlainDate,
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
          format: FormatId.JsonObject.TiptapRichText,
        },
      },
      nullableProperties: ["notes"],
    },
  },
  rootType: "VetVisit",
} satisfies Schema;
