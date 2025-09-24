import { registeredDescribe as rd } from "@superego/vitest-registered";
import { expect } from "vitest";
import type Dependencies from "../../Dependencies.js";
import it from "../../utils/factotumIt.js";
import defineCollection from "../defineCollection.js";

// Note: we pass more than one collection to test that the assistant creates
// documents in the right collections only.

export default rd<Dependencies>(
  "Create documents in a single collection",
  (deps) => {
    it("All info provided, implicit request", { deps }, async (factotum) => {
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
    });

    it(
      "All info provided, explicit request",
      { deps, passRate: 1 },
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
          "Log a refuelling. Kia, 43.04 liters, 58.10 euros, 123456km.",
        );
        await factotum.assertAssistantIs(
          "giving a concise acknowledgement that one or more actions were performed.",
        );
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
      const [, , fuelLogs] = await factotum.createCollections(
        defineCollection.calendar([]),
        defineCollection.contacts([]),
        // Omitted to avoid a document being created here as well.
        // expenses([]),
        defineCollection.fuelLogs([]),
        defineCollection.vetVisits([]),
      );
      await factotum.say("Filled up the Kia. 43.04 liters for 58.10 euros.");
      await factotum.assertAssistantIs(
        "asking for the odometer reading, or stating that the odometer reading is required.",
      );
      await factotum.say("123456");
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
            odometer: 123456,
          },
        ],
        updated: [],
        unmodified: [],
      });
    });

    // TODO: before we can implement this we need to implement a way to categorize
    // the assistant reply and act accordingly.
    it(
      "Multiple info missing, implicit request",
      { deps, todo: true },
      async () => {},
    );

    it(
      "Multiple documents, all-info provided, implicit request",
      { deps },
      async (factotum) => {
        // Exercise + verify
        const [, , expenses] = await factotum.createCollections(
          defineCollection.calendar([]),
          defineCollection.contacts([]),
          defineCollection.expenses([]),
          defineCollection.fuelLogs([]),
          defineCollection.vetVisits([]),
        );
        await factotum.say(
          "Went grocery shopping, spent 50.86 euros. On the way back I stopped for a coffee and a croissant, spent 4.50 euros.",
        );
        await factotum.assertAssistantIs(
          "giving a concise acknowledgement that one or more actions were performed.",
        );
        await factotum.expectCollectionState(expenses.collection.id, {
          created: [
            {
              title: expect.stringMatching(/grocer/i),
              date: expect.todaysPlainDate(),
              amount: 50.86,
              currency: "EUR",
              category: "Groceries",
              paymentMethod: "Credit Card",
            },
            {
              title: expect.stringMatching(/coffee/i),
              date: expect.todaysPlainDate(),
              amount: 4.5,
              currency: "EUR",
              category: "Dining And Takeout",
              paymentMethod: "Credit Card",
            },
          ],
          updated: [],
          unmodified: [],
        });
      },
    );

    it(
      "Multiple documents, one info missing, implicit request",
      { deps },
      async (factotum) => {
        // Exercise + verify
        const [, , expenses] = await factotum.createCollections(
          defineCollection.calendar([]),
          defineCollection.contacts([]),
          defineCollection.expenses([]),
          defineCollection.fuelLogs([]),
          defineCollection.vetVisits([]),
        );
        await factotum.say(
          "Went grocery shopping, spent 50.86 euros. On the way back I stopped at the café downstairs and bought a coffee and a croissant.",
        );
        await factotum.assertAssistantIs(
          "asking how much the user spent at the café (for coffee and the croissant).",
        );
        await factotum.say("4.50");
        await factotum.expectCollectionState(expenses.collection.id, {
          created: [
            {
              title: expect.stringMatching(/grocer/i),
              date: expect.todaysPlainDate(),
              amount: 50.86,
              currency: "EUR",
              category: "Groceries",
              paymentMethod: "Credit Card",
            },
            {
              title: expect.stringMatching(/coffee/i),
              date: expect.todaysPlainDate(),
              amount: 4.5,
              currency: "EUR",
              category: "Dining And Takeout",
              paymentMethod: "Credit Card",
            },
          ],
          updated: [],
          unmodified: [],
        });
      },
    );
  },
);
