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
    await factotum.assertAssistantReply(
      "Is a concise acknowledgement, in Italian (mandatory), that it performed one or more actions.",
    );
    await factotum.expectCollectionState(calendar.collection.id, {
      created: [
        {
          titolo: expect.stringMatching(/idraulico/i),
          oraInizio: tomorrowAt(9),
          oraFine: tomorrowAt(10),
        },
      ],
      updated: [],
      unmodified: [],
    });
  });

  it("French", { deps }, async (factotum) => {
    // Exercise + verify
    const [calendar] = await factotum.createCollections(
      defineCollection.calendarIt([]),
    );
    await factotum.say("Demain à 9 h, le plombier arrive.");
    await factotum.assertAssistantReply(
      "Is a concise acknowledgement, in French (mandatory), that it performed one or more actions.",
    );
    await factotum.expectCollectionState(calendar.collection.id, {
      created: [
        {
          titolo: expect.stringMatching(/plombier/i),
          oraInizio: tomorrowAt(9),
          oraFine: tomorrowAt(10),
        },
      ],
      updated: [],
      unmodified: [],
    });
  });

  it("German", { deps }, async (factotum) => {
    // Exercise + verify
    const [calendar] = await factotum.createCollections(
      defineCollection.calendarIt([]),
    );
    await factotum.say("Morgen um 9 Uhr kommt der Klempner.");
    await factotum.assertAssistantReply(
      "Is a concise acknowledgement, in German (mandatory), that it performed one or more actions.",
    );
    await factotum.expectCollectionState(calendar.collection.id, {
      created: [
        {
          titolo: expect.stringMatching(/klempner/i),
          oraInizio: tomorrowAt(9),
          oraFine: tomorrowAt(10),
        },
      ],
      updated: [],
      unmodified: [],
    });
  });
});
