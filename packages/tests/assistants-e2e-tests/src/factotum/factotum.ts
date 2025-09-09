import { registeredDescribe as rd } from "@superego/vitest-registered";
import { expect, it } from "vitest";
import type Dependencies from "../Dependencies.js";
import { fuelLogs } from "./collections.js";
import FactotumObject from "./FactotumObject/FactotumObject.js";

export default rd<Dependencies>("Factotum", (deps) => {
  it("One-shot document creation", async () => {
    // Setup SUT
    const { backend, booleanOracle } = await deps();
    const factotum = new FactotumObject(backend, booleanOracle);

    // Exercise + verify
    const { collection } = await factotum.createCollection(fuelLogs([]));
    await factotum.say(
      "Filled up the Kia. 43.04 liters for 58.10 euros. Odo 123456.",
    );
    await factotum.replyMust(
      "Be a concise acknowledgement that it performed one or more actions.",
    );
    await factotum.expectCollectionState(collection.id, {
      created: [
        {
          timestamp: expect.closeToNow(20_000),
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

  it("Document creation with one clarification question", async () => {
    // Setup SUT
    const { backend, booleanOracle } = await deps();
    const factotum = new FactotumObject(backend, booleanOracle);

    // Exercise + verify
    const { collection } = await factotum.createCollection(fuelLogs([]));
    await factotum.say("Filled up the Kia. 43.04 liters for 58.10 euros.");
    await factotum.replyMust(
      "Be asking for the odometer reading or telling it's required.",
    );
    await factotum.say("123456");
    await factotum.replyMust(
      "Be a concise acknowledgement that it performed one or more actions.",
    );
    await factotum.expectCollectionState(collection.id, {
      created: [
        {
          timestamp: expect.closeToNow(20_000),
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
});
