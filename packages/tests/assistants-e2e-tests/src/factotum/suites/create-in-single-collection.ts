import { registeredDescribe as rd } from "@superego/vitest-registered";
import { expect } from "vitest";
import type Dependencies from "../../Dependencies.js";
import pit from "../../utils/probabilisticIt.js";
import {
  calendar,
  contacts,
  expenses,
  fuelLogs,
  vetVisits,
} from "../collections.js";
import FactotumObject from "../FactotumObject/FactotumObject.js";

export default rd<Dependencies>("Operations on a single collection", (deps) => {
  pit("All info provided, implicit request", async () => {
    // Setup SUT
    const { backend, booleanOracle } = await deps();
    const factotum = new FactotumObject(backend, booleanOracle);

    // Exercise + verify
    const [, , , { collection }] = await factotum.createCollections(
      calendar([]),
      contacts([]),
      expenses([]),
      fuelLogs([]),
      vetVisits([]),
    );
    await factotum.say(
      "Filled up the Kia. 43.04 liters for 58.10 euros. Odo 123456.",
    );
    await factotum.assistantReply(
      "Is a concise acknowledgement that it performed one or more actions.",
    );
    await factotum.expectCollectionState(collection.id, {
      created: [
        {
          timestamp: expect.closeToNow(60_000),
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

  pit("All info provided, explicit request", async () => {
    // Setup SUT
    const { backend, booleanOracle } = await deps();
    const factotum = new FactotumObject(backend, booleanOracle);

    // Exercise + verify
    const [, , , { collection }] = await factotum.createCollections(
      calendar([]),
      contacts([]),
      expenses([]),
      fuelLogs([]),
      vetVisits([]),
    );
    await factotum.say(
      "Log a refuelling. Kia, 43.04 liters, 58.10 euros, 123456km.",
    );
    await factotum.assistantReply(
      "Is a concise acknowledgement that it performed one or more actions.",
    );
    await factotum.expectCollectionState(collection.id, {
      created: [
        {
          timestamp: expect.closeToNow(60_000),
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

  pit("One info missing, implicit request", async () => {
    // Setup SUT
    const { backend, booleanOracle } = await deps();
    const factotum = new FactotumObject(backend, booleanOracle);

    // Exercise + verify
    const [, , , { collection }] = await factotum.createCollections(
      calendar([]),
      contacts([]),
      expenses([]),
      fuelLogs([]),
      vetVisits([]),
    );
    await factotum.say("Filled up the Kia. 43.04 liters for 58.10 euros.");
    await factotum.assistantReply(
      "Is asking for the odometer reading or telling it's required.",
    );
    await factotum.say("123456");
    await factotum.assistantReply(
      "Is a concise acknowledgement that it performed one or more actions.",
    );
    await factotum.expectCollectionState(collection.id, {
      created: [
        {
          timestamp: expect.closeToNow(20_000),
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
  pit.todo("Multiple info missing, implicit request", async () => {});

  pit("Multiple documents, all-info provided, implicit request", async () => {
    // Setup SUT
    const { backend, booleanOracle } = await deps();
    const factotum = new FactotumObject(backend, booleanOracle);

    // Exercise + verify
    const [, , { collection }] = await factotum.createCollections(
      calendar([]),
      contacts([]),
      expenses([]),
      fuelLogs([]),
      vetVisits([]),
    );
    await factotum.say(
      "Went grocery shopping, spent 50.86 euros. On the way back I stopped for a coffee and a croissant, spent 4.50 euros.",
    );
    await factotum.assistantReply(
      "Is a concise acknowledgement that it performed one or more actions.",
    );
    await factotum.expectCollectionState(collection.id, {
      created: [
        {
          title: expect.stringMatching(/grocer/i),
          date: expect.closeToNow(20_000),
          amount: 50.86,
          category: "Groceries",
          paymentMethod: "Credit Card",
        },
        {
          title: expect.stringMatching(/coffee/i),
          date: expect.closeToNow(20_000),
          amount: 4.5,
          category: "Dining And Takeout",
          paymentMethod: "Credit Card",
        },
      ],
      updated: [],
      unmodified: [],
    });
  });

  pit("Multiple documents, one info missing, implicit request", async () => {
    // Setup SUT
    const { backend, booleanOracle } = await deps();
    const factotum = new FactotumObject(backend, booleanOracle);

    // Exercise + verify
    const [, , { collection }] = await factotum.createCollections(
      calendar([]),
      contacts([]),
      expenses([]),
      fuelLogs([]),
      vetVisits([]),
    );
    await factotum.say(
      "Went grocery shopping, spent 50.86 euros. On the way back I stopped at the café downstairs and bought a coffee and a croissant.",
    );
    await factotum.assistantReply("Is asking how much the coffee cost.");
    await factotum.say("4.50");
    await factotum.expectCollectionState(collection.id, {
      created: [
        {
          title: expect.stringMatching(/grocer/i),
          date: expect.closeToNow(20_000),
          amount: 50.86,
          category: "Groceries",
          paymentMethod: "Credit Card",
        },
        {
          title: expect.stringMatching(/coffee/i),
          date: expect.closeToNow(20_000),
          amount: 4.5,
          category: "Dining And Takeout",
          paymentMethod: "Credit Card",
        },
      ],
      updated: [],
      unmodified: [],
    });
  });
});
