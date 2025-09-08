import { registeredDescribe as rd } from "@superego/vitest-registered";
import { it } from "vitest";
import type Dependencies from "../../Dependencies.js";
import FactotumAssistantObject from "../../utils/FactotumAssistantObject/FactotumAssistantObject.js";
import { fuelLogs } from "./collections.js";

export default rd<Dependencies>("Factotum assistant", (deps) => {
  // afterEach(() => {
  //   vi.useRealTimers();
  // });

  it("One-shot document creation", async () => {
    // Setup SUT
    const { backend, booleanOracle } = await deps();
    const factotum = new FactotumAssistantObject(backend, booleanOracle);
    // const now = new Date();
    // vi.useFakeTimers({ now });
    // vi.setSystemTime(now);

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
          // timestamp: now.toISOString(),
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
    const factotum = new FactotumAssistantObject(backend, booleanOracle);
    // const now = new Date();
    // vi.useFakeTimers({ now });

    // Exercise + verify
    const { collection } = await factotum.createCollection(fuelLogs([]));
    await factotum.say("Filled up the Kia. 43.04 liters for 58.10 euros.");
    await factotum.replyMust("Be asking for the odometer reading.");
    await factotum.say("123456");
    await factotum.replyMust(
      "Be a concise acknowledgement that it performed one or more actions.",
    );
    await factotum.expectCollectionState(collection.id, {
      created: [
        {
          // timestamp: now.toISOString(),
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
