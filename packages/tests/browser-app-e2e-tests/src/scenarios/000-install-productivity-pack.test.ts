import { test } from "../fixture.js";

test("000. Install Productivity pack", async ({
  page,
  aiTap,
  aiAssert,
  aiWaitFor,
}) => {
  await test.step("00. Go to homepage", async () => {
    // Exercise
    await page.goto("/");
    await aiWaitFor("the page shows text 'Your Digital Freedom'");

    // Verify
    await aiAssert(
      "the page shows a logo, name, motto, a chat message input, and an empty sidebar",
    );
  });

  await test.step("01. Click on Bazaar sidebar link", async () => {
    // Exercise
    await aiTap("Bazaar link in the sidebar");
    await aiWaitFor("a list of packs is visible");

    // Verify
    await aiAssert(
      "the Bazaar page shows a list of packs as cards, including a Productivity pack card",
    );
  });

  await test.step("02. Click on Productivity pack", async () => {
    // Exercise
    await aiTap("Productivity pack card");
    await aiWaitFor("an Install button is visible");

    // Verify
    await aiAssert(
      "the Productivity pack detail page is shown with an Install button",
    );
  });

  await test.step("03. Open install modal", async () => {
    // Exercise
    await aiTap("Install button");
    await aiWaitFor("a dialog or modal is visible");

    // Verify
    await aiAssert("an install confirmation modal is shown");
  });

  await test.step("04. Install pack", async () => {
    // Exercise
    await aiTap("Install button inside the dialog or modal");
    await aiWaitFor("a create document link or button is visible");

    // Verify
    await aiAssert(
      "an empty Contacts collection page is shown with a create document button in the top right",
    );
  });
});
