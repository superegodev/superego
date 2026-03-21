import { registeredDescribe as rd } from "@superego/vitest-registered";
import { expect } from "vitest";
import type GetDependencies from "../../GetDependencies.js";
import { tomorrowAt } from "../../utils/dates.js";
import it from "../../utils/factotumIt.js";
import defineCollection from "../defineCollection.js";

export default rd<GetDependencies>(
  "Update documents in a single collection",
  (deps) => {
    it(
      "Immediately after creation, implicit requests",
      { deps },
      async (factotum) => {
        // Exercise + verify
        const [, , fuelLogs] = await factotum.createCollections(
          defineCollection.calendar([]),
          defineCollection.contacts([]),
          // Omitted to avoid a document being created here as well.
          // expenses([]),
          defineCollection.fuelLogs([]),
          defineCollection.vetVisits([]),
        );
        await factotum.say(
          "Filled up the Kia. 43.04 liters for 58.10 euros. Odo 123456.",
        );
        await factotum.assertAssistantIs(
          "giving a concise acknowledgement that one or more actions were performed.",
        );
        await factotum.say("Oh, actually it was 123457.");
        await factotum.assertAssistantIs(
          "giving a concise acknowledgement that one or more actions were performed.",
        );
        await factotum.expectCollectionState(fuelLogs.collection.id, {
          created: [
            {
              timestamp: expect.instantCloseToNow(20_000),
              vehicle: "Kia Sportage",
              liters: 43.04,
              totalCost: 58.1,
              fullTank: true,
              odometer: 123457,
            },
          ],
          updated: [],
          unmodified: [],
        });
      },
    );

    it(
      "Querying existing documents, implicit request",
      { deps },
      async (factotum) => {
        // Exercise + verify
        const [calendar] = await factotum.createCollections(
          defineCollection.calendar([
            {
              type: "Event",
              title: "Plumber comes to fix the leak",
              startTime: tomorrowAt(9),
              endTime: tomorrowAt(10),
              notes: null,
            },
          ]),
          defineCollection.contacts([]),
          defineCollection.expenses([]),
          defineCollection.fuelLogs([]),
          defineCollection.vetVisits([]),
        );
        await factotum.say("Tomorrow the plumber will come at 10, not at 9.");
        await factotum.assertAssistantIs(
          "giving a concise acknowledgement that one or more actions were performed.",
        );
        await factotum.expectCollectionState(calendar.collection.id, {
          created: [],
          updated: [
            {
              document: calendar.documents[0]!,
              newContentMatching: {
                startTime: expect.instantEquivalentTo(tomorrowAt(10)),
                endTime: expect.instantEquivalentTo(tomorrowAt(11)),
              },
            },
          ],
          unmodified: [],
        });
      },
    );

    it(
      "Querying existing documents, explicit request",
      { deps, passRate: 1 },
      async (factotum) => {
        // Exercise + verify
        const [calendar] = await factotum.createCollections(
          defineCollection.calendar([
            {
              type: "Event",
              title: "Plumber comes to fix the leak",
              startTime: tomorrowAt(9),
              endTime: tomorrowAt(10),
              notes: null,
            },
          ]),
          defineCollection.contacts([]),
          defineCollection.expenses([]),
          defineCollection.fuelLogs([]),
          defineCollection.vetVisits([]),
        );
        await factotum.say("Move tomorrow's plumber appointment to 10.");
        await factotum.assertAssistantIs(
          "giving a concise acknowledgement that one or more actions were performed.",
        );
        await factotum.expectCollectionState(calendar.collection.id, {
          created: [],
          updated: [
            {
              document: calendar.documents[0]!,
              newContentMatching: {
                startTime: expect.instantEquivalentTo(tomorrowAt(10)),
                endTime: expect.instantEquivalentTo(tomorrowAt(11)),
              },
            },
          ],
          unmodified: [],
        });
      },
    );
  },
);
