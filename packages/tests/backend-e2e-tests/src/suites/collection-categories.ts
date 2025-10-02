import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type Dependencies from "../Dependencies.js";

export default rd<Dependencies>("Collection categories", (deps) => {
  describe("create", () => {
    it("CollectionCategoryNameNotValid", async () => {
      // Setup SUT
      const { backend } = await deps();

      // Exercise
      const result = await backend.collectionCategories.create({
        name: "",
        icon: null,
        parentId: null,
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CollectionCategoryNameNotValid",
          details: {
            collectionCategoryId: null,
            issues: [
              {
                message: "Invalid length: Expected >=1 but received 0",
                path: undefined,
              },
            ],
          },
        },
      });
    });
  });
});
