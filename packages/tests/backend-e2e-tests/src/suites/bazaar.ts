import { packs } from "@superego/bazaar";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Bazaar", (deps) => {
  describe("listPacks", () => {
    it("success: lists bazaar packs as lite packs", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.bazaar.listPacks();

      // Verify
      expect(result.data).toHaveLength(packs.length);
    });
  });

  describe("getPack", () => {
    it("error: PackNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const packId = "Pack_com.example.unknown";
      const result = await backend.bazaar.getPack(packId);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "PackNotFound",
          details: { packId },
        },
      });
    });

    it("success: gets pack by id", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const results = await Promise.all(
        packs.map((pack) => backend.bazaar.getPack(pack.id)),
      );

      // Verify
      expect(results).toEqual(
        packs.map((pack) => ({
          success: true,
          data: pack,
          error: null,
        })),
      );
    });
  });
});
