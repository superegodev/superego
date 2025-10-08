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
      const mockConnector: Connector.OAuth2 = {
        name: "MockConnector",
        authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2,
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
        getAuthorizationRequestUrl: () => "authorizationRequestUrl",
        getAuthenticationState: async () => ({
          success: true,
          data: {
            email: "email",
            accessToken: "accessToken",
            refreshToken: "refreshToken",
            accessTokenExpiresAt: new Date(),
          },
          error: null,
        }),
        syncDown: async ({ authenticationState }) => ({
          success: true,
          data: {
            changes: { addedOrModified: [], deleted: [] },
            authenticationState,
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
        { clientId: "clientId", clientSecret: "clientSecret" },
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
      const authenticateOAuth2ConnectorResult =
        await backend.collections.authenticateOAuth2Connector(
          createCollectionResult.data.id,
          "authorizationResponseUrl",
        );
      assert.isTrue(authenticateOAuth2ConnectorResult.success);
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
