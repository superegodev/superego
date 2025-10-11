import {
  type Backend,
  BackgroundJobName,
  BackgroundJobStatus,
  type CollectionId,
  DownSyncStatus,
} from "@superego/backend";
import { assert, expect, vi } from "vitest";

export default async function triggerAndWaitForDownSync(
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
