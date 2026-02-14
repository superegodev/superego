import { test } from "../fixture.js";

test("000. Install Productivity pack", async ({ page, aiTap, aiAssert }) => {
  await page.goto("/");
  await aiAssert("homepage is visible with an empty workspace");

  await aiTap("open the left sidebar");
  await aiTap("Bazaar");
  await aiTap("Productivity pack card");
  await aiTap("Install button");
  await aiTap("Install button in the confirmation dialog");

  await aiAssert(
    "Contacts collection page is visible and has a Create document action",
  );
});
