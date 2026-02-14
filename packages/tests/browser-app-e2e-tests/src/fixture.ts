import { test as base } from "@playwright/test";
import { PlaywrightAiFixture } from "@midscene/web/playwright";
import type { PlayWrightAiFixtureType } from "@midscene/web/playwright";

export const test = base.extend<PlayWrightAiFixtureType>(
  PlaywrightAiFixture({
    waitForNetworkIdleTimeout: 2_000,
  }),
);
