import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Files", (deps) => {
  describe("getContent", () => {
    it("error: FileNotFound (case: no collection nor document)", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const collectionId = Id.generate.collection();
      const documentId = Id.generate.document();
      const fileId = Id.generate.file();
      const result = await backend.files.getContent(
        collectionId,
        documentId,
        fileId,
      );

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

    it("error: FileNotFound (case: document mismatches)", async () => {
      // Setup SUT
      const { backend } = deps();
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { attachment: { dataType: DataType.File } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);
      const fileContent = new TextEncoder().encode("file-content");
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        {
          attachment: {
            name: "file.txt",
            mimeType: "text/plain",
            content: fileContent,
          },
        },
      );
      assert.isTrue(createDocumentResult.success);
      const attachment =
        createDocumentResult.data.latestVersion.content.attachment;
      assert.isDefined(attachment);
      const fileId = attachment.id;

      // Exercise
      const wrongDocumentId = Id.generate.document();
      const getFileContentResult = await backend.files.getContent(
        createCollectionResult.data.id,
        wrongDocumentId,
        fileId,
      );

      // Verify
      expect(getFileContentResult).toEqual({
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
      const createCollectionResult = await backend.collections.create(
        {
          name: "name",
          icon: null,
          collectionCategoryId: null,
          description: null,
          assistantInstructions: null,
        },
        {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { attachment: { dataType: DataType.File } },
            },
          },
          rootType: "Root",
        },
        {
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
        },
      );
      assert.isTrue(createCollectionResult.success);

      const fileContent = new TextEncoder().encode("file-content");
      const createDocumentResult = await backend.documents.create(
        createCollectionResult.data.id,
        {
          attachment: {
            name: "file.txt",
            mimeType: "text/plain",
            content: fileContent,
          },
        },
      );
      assert.isTrue(createDocumentResult.success);
      const attachment =
        createDocumentResult.data.latestVersion.content.attachment;
      assert.isDefined(attachment);
      const fileId = attachment.id;

      // Exercise
      const getContentResult = await backend.files.getContent(
        createCollectionResult.data.id,
        createDocumentResult.data.id,
        fileId,
      );

      // Verify
      expect(getContentResult).toEqual({
        success: true,
        data: fileContent,
        error: null,
      });
    });
  });
});
