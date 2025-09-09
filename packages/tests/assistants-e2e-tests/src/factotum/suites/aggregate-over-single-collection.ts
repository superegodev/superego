import { registeredDescribe as rd } from "@superego/vitest-registered";
import type Dependencies from "../../Dependencies.js";
import { nDaysAgo } from "../../utils/dates.js";
import pit from "../../utils/probabilisticIt.js";
import defineCollection from "../defineCollection.js";
import FactotumObject from "../FactotumObject/FactotumObject.js";

export default rd<Dependencies>("Search in a single collection", (deps) => {
  pit("Getting aggregate results from a subset of documents", async () => {
    // Setup SUT
    const { backend, booleanOracle } = await deps();
    const factotum = new FactotumObject(backend, booleanOracle);

    // Exercise + verify
    await factotum.createCollections(
      defineCollection.calendar([]),
      defineCollection.contacts([]),
      defineCollection.expenses([]),
      defineCollection.fuelLogs([
        {
          timestamp: nDaysAgo(40),
          vehicle: "Kia Sportage",
          liters: 49.99,
          totalCost: 70.99,
          fullTank: true,
          odometer: 100_000,
          notes: null,
        },
        {
          timestamp: nDaysAgo(29),
          vehicle: "Kia Sportage",
          liters: 43.04,
          totalCost: 58.1,
          fullTank: true,
          odometer: 100_531,
          notes: null,
        },
        {
          timestamp: nDaysAgo(29),
          vehicle: "Suzuki Jimny",
          liters: 33.04,
          totalCost: 44.6,
          fullTank: true,
          odometer: 50_000,
          notes: null,
        },
        {
          timestamp: nDaysAgo(11),
          vehicle: "Kia Sportage",
          liters: 54.32,
          totalCost: 78.11,
          fullTank: true,
          odometer: 101_298,
          notes: null,
        },
      ]),
      defineCollection.vetVisits([]),
    );
    await factotum.say(
      "How much did I spend in the past 30 days on fuel for my Kia?",
    );
    await factotum.assertAssistantReply(
      'Is a concise answer telling how much the user spent on fuel in the past 30 days, "136.21 euros".',
    );
  });
});
