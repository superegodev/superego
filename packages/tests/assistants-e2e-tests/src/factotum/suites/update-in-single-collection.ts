import { registeredDescribe as rd } from "@superego/vitest-registered";
import { expect } from "vitest";
import type Dependencies from "../../Dependencies.js";
import { tomorrowAt } from "../../utils/dates.js";
import pit from "../../utils/probabilisticIt.js";
import {
  calendar,
  contacts,
  expenses,
  fuelLogs,
  vetVisits,
} from "../collections.js";
import FactotumObject from "../FactotumObject/FactotumObject.js";

export default rd<Dependencies>(
  "Update documents in a single collection",
  (deps) => {
    pit("Immediately after creation, implicit requests", async () => {
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
        "Be a concise acknowledgement that it performed one or more actions.",
      );
      await factotum.say("Oh, actually it was 123457.");
      await factotum.assistantReply(
        "Be a concise acknowledgement that it performed one or more actions.",
      );
      await factotum.expectCollectionState(collection.id, {
        created: [
          {
            timestamp: expect.closeToNow(20_000),
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
    });

    pit("From zero, implicit request", async () => {
      // Setup SUT
      const { backend, booleanOracle } = await deps();
      const factotum = new FactotumObject(backend, booleanOracle);

      // Exercise + verify
      const [{ collection, documents }] = await factotum.createCollections(
        calendar([
          {
            type: "Event",
            title: "Plumber comes to fix the leak",
            startTime: tomorrowAt(9),
            endTime: tomorrowAt(10),
            notes: null,
          },
        ]),
        contacts([]),
        expenses([]),
        fuelLogs([]),
        vetVisits([]),
      );
      await factotum.say("Tomorrow the plumber will come at 10, not at 9.");
      await factotum.assistantReply(
        "Be a concise acknowledgement that it performed one or more actions.",
      );
      await factotum.expectCollectionState(collection.id, {
        created: [],
        updated: [
          {
            document: documents[0]!,
            newContentMatching: {
              startTime: tomorrowAt(10),
              endTime: tomorrowAt(11),
            },
          },
        ],
        unmodified: [],
      });
    });

    pit("From zero, explicit request", async () => {
      // Setup SUT
      const { backend, booleanOracle } = await deps();
      const factotum = new FactotumObject(backend, booleanOracle);

      // Exercise + verify
      const [{ collection, documents }] = await factotum.createCollections(
        calendar([
          {
            type: "Event",
            title: "Plumber comes to fix the leak",
            startTime: tomorrowAt(9),
            endTime: tomorrowAt(10),
            notes: null,
          },
        ]),
        contacts([]),
        expenses([]),
        fuelLogs([]),
        vetVisits([]),
      );
      await factotum.say("Move tomorrow's plumber appointment to 10.");
      await factotum.assistantReply(
        "Be a concise acknowledgement that it performed one or more actions.",
      );
      await factotum.expectCollectionState(collection.id, {
        created: [],
        updated: [
          {
            document: documents[0]!,
            newContentMatching: {
              startTime: tomorrowAt(10),
              endTime: tomorrowAt(11),
            },
          },
        ],
        unmodified: [],
      });
    });
  },
);
