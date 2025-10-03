import {
  type Backend,
  BackgroundJobName,
  BackgroundJobStatus,
  type CollectionId,
  DownSyncStatus,
} from "@superego/backend";
import type { Connector } from "@superego/executing-backend";
import { DataType } from "@superego/schema";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it, vi } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Collections down-sync", (deps) => {
  describe("triggerDownSync", () => {
    it("success: syncs remote changes (case: first sync)", async () => {
      // Setup mocks
      const changes: Connector.Changes = {
        addedOrModified: [
          {
            id: "remoteId1",
            versionId: "remoteVersionId1",
            content: { title: "title1" },
          },
          {
            id: "remoteId2",
            versionId: "remoteVersionId2",
            content: { title: "title2" },
          },
        ],
        deleted: [],
      };
      const mockConnector: Connector = {
        name: "MockConnector",
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
          data: { changes, syncPoint: "syncPoint" },
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

      // Exercise
      await triggerAndWaitForDownSync(backend, createCollectionResult.data.id);

      // Verify downSync succeeded
      const listResult = await backend.collections.list();
      assert.isTrue(listResult.success);
      const collection = listResult.data.find(
        ({ id }) => id === createCollectionResult.data.id,
      );
      assert.isDefined(collection);
      expect(collection.remote?.syncState.down).toEqual(
        expect.objectContaining({
          status: DownSyncStatus.LastSyncSucceeded,
          error: null,
        }),
      );

      // Verify documents were down synced
      const documentsListResult = await backend.documents.list(
        createCollectionResult.data.id,
      );
      assert.isTrue(documentsListResult.success);
      expect(documentsListResult.data).toHaveLength(
        changes.addedOrModified.length,
      );
      expect(documentsListResult.data).toEqual(
        expect.arrayContaining(
          changes.addedOrModified.map((remoteDocument) =>
            expect.objectContaining({
              id: expect.id("Document"),
              remoteId: remoteDocument.id,
              collectionId: createCollectionResult.data.id,
              latestVersion: expect.objectContaining({
                id: expect.id("DocumentVersion"),
                remoteId: remoteDocument.versionId,
                createdBy: "Connector",
                createdAt: expect.dateCloseToNow(),
              }),
              createdAt: expect.dateCloseToNow(),
            }),
          ),
        ),
      );
    });
  });
});

async function triggerAndWaitForDownSync(
  backend: Backend,
  collectionId: CollectionId,
) {
  const triggerDownSyncResult =
    await backend.collections.triggerDownSync(collectionId);
  expect(triggerDownSyncResult).toEqual({
    success: true,
    data: expect.objectContaining({
      remote: expect.objectContaining({
        syncState: expect.objectContaining({
          down: expect.objectContaining({
            status: DownSyncStatus.Syncing,
            error: null,
          }),
        }),
      }),
    }),
    error: null,
  });
  await vi.waitUntil(
    async () => {
      const listJobsResult = await backend.backgroundJobs.list();
      assert.isTrue(listJobsResult.success);
      return listJobsResult.data
        .filter(({ name }) => name === BackgroundJobName.DownSyncCollection)
        .every(({ status }) => status === BackgroundJobStatus.Succeeded);
    },
    { interval: 5, timeout: 5_000 },
  );
}
