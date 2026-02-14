import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Files", (deps) => {
  describe("getContent", () => {
    it("error: FileNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const fileId = Id.generate.file();
      const result = await backend.files.getContent(fileId);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "FileNotFound",
          details: { fileId },
        },
      });
    });

    it("success: gets content", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { attachment: { dataType: DataType.File } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          defaultDocumentLayoutOptions: null,
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      });
      assert.isTrue(createCollectionResult.success);

      const fileContent = new TextEncoder().encode("file-content");
      const createDocumentResult = await backend.documents.create({
        collectionId: createCollectionResult.data.id,
        content: {
          attachment: {
            name: "file.txt",
            mimeType: "text/plain",
            content: fileContent,
          },
        },
      });
      assert.isTrue(createDocumentResult.success);
      const attachment =
        createDocumentResult.data.latestVersion.content.attachment;
      assert.isDefined(attachment);
      const fileId = attachment.id;

      // Exercise
      const getContentResult = await backend.files.getContent(fileId);

      // Verify
      expect(getContentResult).toEqual({
        success: true,
        data: fileContent,
        error: null,
      });
    });
  });
});
