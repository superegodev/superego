import {
  BackgroundJobName,
  BackgroundJobStatus,
  ConnectorAuthenticationStrategy,
} from "@superego/backend";
import type { Connector } from "@superego/executing-backend";
import { DataType } from "@superego/schema";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";
import triggerAndWaitForDownSync from "../utils/triggerAndWaitForDownSync.js";

export default rd<GetDependencies>("Background Jobs", (deps) => {
  describe("list", () => {
    it("success: returns empty array when there are no background jobs", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.backgroundJobs.list();

      // Verify
      expect(result).toEqual({
        success: true,
        data: [],
        error: null,
      });
    });

    it("success: lists down sync jobs", async () => {
      // Setup mocks
      const mockConnector: Connector = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuthPKCE,
        settingsSchema: {
          types: { Settings: { dataType: DataType.Struct, properties: {} } },
          rootType: "Settings",
        },
        remoteDocumentSchema: {
          types: {
            RemoteDocument: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "RemoteDocument",
        },
        syncDown: async () => ({
          success: true,
          data: {
            changes: { addedOrModified: [], deleted: [] },
            syncPoint: "syncPoint",
          },
          error: null,
        }),
      };

      // Setup SUT
      const { backend } = deps(mockConnector);
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
              properties: { title: { dataType: DataType.String } },
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
      const setRemoteResult = await backend.collections.setRemote(
        createCollectionResult.data.id,
        mockConnector.name,
        { url: "url", clientId: "clientId", scopes: [] },
        {},
        {
          fromRemoteDocument: {
            source: "",
            compiled:
              "export default function fromRemoteDocument(remote) { return { title: remote.title }; }",
          },
        },
      );
      assert.isTrue(setRemoteResult.success);
      const authenticateRemoteConnectorResult =
        await backend.collections.authenticateRemoteConnector(
          createCollectionResult.data.id,
          { accessToken: "accessToken", refreshToken: "refreshToken" },
        );
      assert.isTrue(authenticateRemoteConnectorResult.success);
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);

      // Exercise
      const listBackgroundJobsResult = await backend.backgroundJobs.list();

      // Verify
      expect(listBackgroundJobsResult).toEqual({
        success: true,
        data: [
          {
            id: expect.id("BackgroundJob"),
            name: BackgroundJobName.DownSyncCollection,
            status: BackgroundJobStatus.Succeeded,
            input: { id: createCollectionResult.data.id },
            error: null,
            enqueuedAt: expect.dateCloseToNow(),
            startedProcessingAt: expect.dateCloseToNow(),
            finishedProcessingAt: expect.dateCloseToNow(),
          },
        ],
        error: null,
      });
    });
  });
});
