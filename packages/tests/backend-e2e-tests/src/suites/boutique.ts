import { packs } from "@superego/boutique";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Boutique", (deps) => {
  describe("listPacks", () => {
    it("success: lists boutique packs as lite packs", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.boutique.listPacks();

      // Verify
      expect(result.data).toHaveLength(packs.length);
    });
  });

  describe("getPack", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.boutique.getPack("not-a-valid-id" as any);

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

    it("error: PackNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const packId = "Pack_com.example.unknown";
      const result = await backend.boutique.getPack(packId);

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
        packs.map((pack) => backend.boutique.getPack(pack.id)),
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

  describe("static app files", () => {
    it("success: every boutique app has source and static runtime files", () => {
      // Setup SUT

      // Exercise
      const appFiles = packs.flatMap((pack) =>
        pack.apps.map((app) => app.files),
      );

      // Verify
      expect(appFiles.length).toBeGreaterThan(0);
      for (const files of appFiles) {
        expect(files["/src/main.tsx"]).toMatchObject({
          role: "source",
          mimeType: "text/plain",
        });
        expect(files["/dist/index.html"]).toMatchObject({
          role: "build",
          mimeType: "text/html",
        });
        expect(files["/dist/main.js"]).toMatchObject({
          role: "build",
          mimeType: "text/javascript",
        });
      }
    });

    it("success: installs every boutique pack", async () => {
      // Setup SUT

      // Exercise / Verify
      for (const pack of packs) {
        const { backend } = deps();
        const installResult = await backend.packs.install(pack);
        assert.isTrue(installResult.success);
      }
    });
  });
});
