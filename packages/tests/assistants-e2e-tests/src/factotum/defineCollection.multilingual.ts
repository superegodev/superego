import { DataType } from "@superego/schema";
import type FactotumObject from "../utils/FactotumObject.js";

const calendarIt = (
  documentContents: object[],
): FactotumObject.CollectionDefinition => ({
  name: "Calendario",
  description: "Il mio calendario personale.",
  assistantInstructions: [
    "- Se la durata non è indicata per gli eventi, impostarla di default a 1 ora.",
  ].join("\n"),
  schema: {
    types: {
      Tipo: {
        description: "Tipo di una voce di calendario.",
        dataType: DataType.Enum,
        members: {
          Evento: {
            description:
              "Un evento, con un orario di inizio definito e un orario di fine definito.",
            value: "Evento",
          },
          Promemoria: {
            description:
              "Un promemoria, con un orario di inizio definito ma senza orario di fine.",
            value: "Promemoria",
          },
        },
      },
      VoceCalendario: {
        description: "Una voce nel mio calendario.",
        dataType: DataType.Struct,
        properties: {
          tipo: {
            description: "Il tipo della voce.",
            dataType: null,
            ref: "Tipo",
          },
          titolo: {
            description: "Titolo breve per la voce. Massimo 5 parole.",
            dataType: DataType.String,
          },
          oraInizio: {
            description: "Quando inizia l'evento o il promemoria.",
            dataType: DataType.String,
            format: "dev.superego:String.Instant",
          },
          oraFine: {
            description:
              "Quando termina l'evento o il promemoria. Null per i promemoria.",
            dataType: DataType.String,
            format: "dev.superego:String.Instant",
          },
          note: {
            description: "Note varie.",
            dataType: DataType.JsonObject,
            format: "dev.superego:JsonObject.TiptapRichText",
          },
        },
        nullableProperties: ["oraFine", "note"],
      },
    },
    rootType: "VoceCalendario",
  },
  documentContents,
});

const calendarFr = (
  documentContents: object[],
): FactotumObject.CollectionDefinition => ({
  name: "Calendrier",
  description: "Mon calendrier personnel.",
  assistantInstructions: [
    "- Si la durée n’est pas indiquée pour les événements, définir par défaut 1 heure.",
  ].join("\n"),
  schema: {
    types: {
      Type: {
        description: "Type d’une entrée de calendrier.",
        dataType: DataType.Enum,
        members: {
          Evenement: {
            description:
              "Un événement, avec une heure de début définie et une heure de fin définie.",
            value: "Événement",
          },
          Rappel: {
            description:
              "Un rappel, avec une heure de début définie mais sans heure de fin.",
            value: "Rappel",
          },
        },
      },
      EntreeCalendrier: {
        description: "Une entrée dans mon calendrier.",
        dataType: DataType.Struct,
        properties: {
          type: {
            description: "Le type de l’entrée.",
            dataType: null,
            ref: "Type",
          },
          titre: {
            description: "Titre court pour l’entrée. 5 mots max.",
            dataType: DataType.String,
          },
          heureDebut: {
            description: "Quand l’événement ou le rappel commence.",
            dataType: DataType.String,
            format: "dev.superego:String.Instant",
          },
          heureFin: {
            description:
              "Quand l’événement ou le rappel se termine. Null pour les rappels.",
            dataType: DataType.String,
            format: "dev.superego:String.Instant",
          },
          notes: {
            description: "Notes diverses.",
            dataType: DataType.JsonObject,
            format: "dev.superego:JsonObject.TiptapRichText",
          },
        },
        nullableProperties: ["heureFin", "notes"],
      },
    },
    rootType: "EntreeCalendrier",
  },
  documentContents,
});

const calendarDe = (
  documentContents: object[],
): FactotumObject.CollectionDefinition => ({
  name: "Kalender",
  description: "Mein persönlicher Kalender.",
  assistantInstructions: [
    "- Wenn für Ereignisse keine Dauer angegeben ist, standardmäßig 1 Stunde ansetzen.",
  ].join("\n"),
  schema: {
    types: {
      Typ: {
        description: "Typ eines Kalendereintrags.",
        dataType: DataType.Enum,
        members: {
          Ereignis: {
            description:
              "Ein Ereignis mit definiertem Start- und Endzeitpunkt.",
            value: "Ereignis",
          },
          Erinnerung: {
            description:
              "Eine Erinnerung mit definiertem Startzeitpunkt, aber ohne Endzeitpunkt.",
            value: "Erinnerung",
          },
        },
      },
      Kalendereintrag: {
        description: "Ein Eintrag in meinem Kalender.",
        dataType: DataType.Struct,
        properties: {
          typ: {
            description: "Der Typ des Eintrags.",
            dataType: null,
            ref: "Typ",
          },
          titel: {
            description: "Kurzer Titel für den Eintrag. Maximal 5 Wörter.",
            dataType: DataType.String,
          },
          startzeit: {
            description: "Wann das Ereignis oder die Erinnerung beginnt.",
            dataType: DataType.String,
            format: "dev.superego:String.Instant",
          },
          endzeit: {
            description:
              "Wann das Ereignis oder die Erinnerung endet. Null bei Erinnerungen.",
            dataType: DataType.String,
            format: "dev.superego:String.Instant",
          },
          notizen: {
            description: "Sonstige Notizen.",
            dataType: DataType.JsonObject,
            format: "dev.superego:JsonObject.TiptapRichText",
          },
        },
        nullableProperties: ["endzeit", "notizen"],
      },
    },
    rootType: "Kalendereintrag",
  },
  documentContents,
});

export default { calendarIt, calendarFr, calendarDe };
