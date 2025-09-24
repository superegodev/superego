import { registeredDescribe as rd } from "@superego/vitest-registered";
import { expect } from "vitest";
import type Dependencies from "../../Dependencies.js";
import { tomorrowAt } from "../../utils/dates.js";
import it from "../../utils/factotumIt.js";
import defineCollection from "../defineCollection.multilingual.js";

export default rd<Dependencies>("Speak in different languages", (deps) => {
  it("Italian", { deps }, async (factotum) => {
    // Exercise + verify
    const [calendar] = await factotum.createCollections(
      defineCollection.calendarIt([]),
    );
    await factotum.say("Domani alle 9 arriva l'idraulico.");
    await factotum.assertAssistantIs(
      "giving a concise acknowledgement, in Italian (mandatory), that one or more actions were performed.",
    );
    await factotum.expectCollectionState(calendar.collection.id, {
      created: [
        {
          titolo: expect.stringMatching(/idraulico/i),
          oraInizio: expect.instantEquivalentTo(tomorrowAt(9)),
          oraFine: expect.instantEquivalentTo(tomorrowAt(10)),
        },
      ],
      updated: [],
      unmodified: [],
    });
  });

  it("French", { deps }, async (factotum) => {
    // Exercise + verify
    const [calendar] = await factotum.createCollections(
      defineCollection.calendarFr([]),
    );
    await factotum.say("Demain à 9 h, le plombier arrive.");
    await factotum.assertAssistantIs(
      "giving a concise acknowledgement, in French (mandatory), that it one or more actions were performed.",
    );
    await factotum.expectCollectionState(calendar.collection.id, {
      created: [
        {
          titre: expect.stringMatching(/plombier/i),
          heureDebut: expect.instantEquivalentTo(tomorrowAt(9)),
          heureFin: expect.instantEquivalentTo(tomorrowAt(10)),
        },
      ],
      updated: [],
      unmodified: [],
    });
  });

  it("German", { deps }, async (factotum) => {
    // Exercise + verify
    const [calendar] = await factotum.createCollections(
      defineCollection.calendarDe([]),
    );
    await factotum.say("Morgen um 9 Uhr kommt der Klempner.");
    await factotum.assertAssistantIs(
      "giving a concise acknowledgement, in German (mandatory), that one or more actions were performed.",
    );
    await factotum.expectCollectionState(calendar.collection.id, {
      created: [
        {
          titel: expect.stringMatching(/klempner/i),
          startzeit: expect.instantEquivalentTo(tomorrowAt(9)),
          endzeit: expect.instantEquivalentTo(tomorrowAt(10)),
        },
      ],
      updated: [],
      unmodified: [],
    });
  });
});
