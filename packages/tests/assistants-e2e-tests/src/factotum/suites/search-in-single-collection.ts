import { registeredDescribe as rd } from "@superego/vitest-registered";
import type GetDependencies from "../../GetDependencies.js";
import { tomorrowAt } from "../../utils/dates.js";
import it from "../../utils/factotumIt.js";
import defineCollection from "../defineCollection.js";

export default rd<GetDependencies>("Search in a single collection", (deps) => {
  it("Getting info from one document", { deps }, async (factotum) => {
    // Exercise + verify
    await factotum.createCollections(
      defineCollection.calendar([]),
      defineCollection.contacts([
        {
          type: "Person",
          name: "Mario",
          relation: "Plumber",
          phones: [],
          emails: [],
          notes: null,
        },
        {
          type: "Person",
          name: "Bob",
          relation: "Builder",
          phones: [],
          emails: [],
          notes: null,
        },
      ]),
      defineCollection.expenses([]),
      defineCollection.fuelLogs([]),
      defineCollection.vetVisits([]),
    );
    await factotum.say("What's the name of my plumber?");
    await factotum.assertAssistantIs(
      'giving a concise answer telling the name of a person, "Mario".',
    );
  });

  it(
    "Getting info from multiple documents",
    { deps, passRate: 1 },
    async (factotum) => {
      // Exercise + verify
      await factotum.createCollections(
        defineCollection.calendar([
          {
            type: "Event",
            title: "Plumber comes to fix the leak",
            startTime: tomorrowAt(9),
            endTime: tomorrowAt(10),
            notes: null,
          },
          {
            type: "Event",
            title: "Work on new AI assistant features",
            startTime: tomorrowAt(14),
            endTime: tomorrowAt(16),
            notes: null,
          },
          {
            type: "Event",
            title: "Aperitif with Mario",
            startTime: tomorrowAt(17),
            endTime: tomorrowAt(18),
            notes: null,
          },
        ]),
        defineCollection.contacts([]),
        defineCollection.expenses([]),
        defineCollection.fuelLogs([]),
        defineCollection.vetVisits([]),
      );
      await factotum.say("What appointments do I have tomorrow afternoon?");
      await factotum.assertAssistantIs(
        [
          "giving a list of two calendar appointments:",
          "1. Work on new AI assistant features, from 14 to 16.",
          "2. Aperitif with Mario, from 17 to 18.",
        ].join("\n"),
      );
    },
  );
});
