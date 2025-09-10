import { registeredDescribe as rd } from "@superego/vitest-registered";
import { expect } from "vitest";
import type Dependencies from "../../Dependencies.js";
import it from "../../utils/factotumIt.js";
import defineCollection from "../defineCollection.js";

export default rd<Dependencies>(
  "Create documents in multiple collections",
  (deps) => {
    it(
      "All info provided, implicit request",
      { deps, only: true },
      async (factotum) => {
        // Exercise + verify
        const [, , expenses, fuelLogs] = await factotum.createCollections(
          defineCollection.calendar([]),
          defineCollection.contacts([]),
          defineCollection.expenses([]),
          defineCollection.fuelLogs([]),
          defineCollection.vetVisits([]),
        );
        await factotum.say(
          "Filled up the Kia. 43.04 liters for 58.10 euros. Odo 123456.",
        );
        await factotum.assertAssistantReply(
          "Is a concise acknowledgement that it performed one or more actions.",
        );
        await factotum.expectCollectionState(expenses.collection.id, {
          created: [
            {
              date: expect.todaysPlainDate(),
              amount: 58.1,
              category: "Transportation",
              paymentMethod: "Credit Card",
            },
          ],
          updated: [],
          unmodified: [],
        });
        await factotum.expectCollectionState(fuelLogs.collection.id, {
          created: [
            {
              timestamp: expect.instantCloseToNow(60_000),
              vehicle: "Kia Sportage",
              liters: 43.04,
              totalCost: 58.1,
              fullTank: true,
              odometer: 123456,
            },
          ],
          updated: [],
          unmodified: [],
        });
      },
    );

    it(
      "All info provided, explicit request",
      { deps, passRate: 1 },
      async (factotum) => {
        // Exercise + verify
        const [, , expenses, fuelLogs] = await factotum.createCollections(
          defineCollection.calendar([]),
          defineCollection.contacts([]),
          defineCollection.expenses([]),
          defineCollection.fuelLogs([]),
          defineCollection.vetVisits([]),
        );
        await factotum.say(
          "Log a refuelling. Kia, 43.04 liters, 58.10 euros, 123456km. Also log it as an expense.",
        );
        await factotum.assertAssistantReply(
          "Is a concise acknowledgement that it performed one or more actions.",
        );
        await factotum.expectCollectionState(expenses.collection.id, {
          created: [
            {
              date: expect.todaysPlainDate(),
              amount: 58.1,
              category: "Transportation",
              paymentMethod: "Credit Card",
            },
          ],
          updated: [],
          unmodified: [],
        });
        await factotum.expectCollectionState(fuelLogs.collection.id, {
          created: [
            {
              timestamp: expect.instantCloseToNow(60_000),
              vehicle: "Kia Sportage",
              liters: 43.04,
              totalCost: 58.1,
              fullTank: true,
              odometer: 123456,
            },
          ],
          updated: [],
          unmodified: [],
        });
      },
    );

    it("One info missing, implicit request", { deps }, async (factotum) => {
      // Exercise + verify
      const [, , expenses, fuelLogs] = await factotum.createCollections(
        defineCollection.calendar([]),
        defineCollection.contacts([]),
        defineCollection.expenses([]),
        defineCollection.fuelLogs([]),
        defineCollection.vetVisits([]),
      );
      await factotum.say("Filled up the Kia. 43.04 liters for 58.10 euros.");
      await factotum.assertAssistantReply(
        "Is asking for the odometer reading or telling it's required.",
      );
      await factotum.say("123456");
      await factotum.assertAssistantReply(
        "Is a concise acknowledgement that it performed one or more actions.",
      );
      await factotum.expectCollectionState(expenses.collection.id, {
        created: [
          {
            date: expect.todaysPlainDate(),
            amount: 58.1,
            category: "Transportation",
            paymentMethod: "Credit Card",
          },
        ],
        updated: [],
        unmodified: [],
      });
      await factotum.expectCollectionState(fuelLogs.collection.id, {
        created: [
          {
            timestamp: expect.instantCloseToNow(20_000),
            vehicle: "Kia Sportage",
            liters: 43.04,
            totalCost: 58.1,
            fullTank: true,
            odometer: 123456,
          },
        ],
        updated: [],
        unmodified: [],
      });
    });
  },
);
