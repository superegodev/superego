import openSidebar from "../actions/openSidebar.js";
import test from "../test.js";
import VisualEvaluator from "../VisualEvaluator.js";

test("009. Set inference settings", async ({ page }) => {
  await test.step("00. Go to the Settings page", async () => {
    // Exercise
    await page.goto("/");
    await openSidebar(page);
    await page.getByRole("link", { name: /^Settings$/i }).click();
    await page.getByText("Superego Global Settings").waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "00.png",
      page,
      "Settings page with Inference tab active, empty providers, default inference options sections",
    );
  });

  await test.step("01. Add an inference provider", async () => {
    // Exercise
    await page.getByRole("button", { name: /Add provider/i }).click();
    await page.getByRole("textbox", { name: /^Name$/i }).fill("openrouter");
    await page
      .getByRole("textbox", { name: /^Base URL$/i })
      .fill("https://openrouter.ai/api/v1/responses");
    // Wait for the form setSubmitDisabled debounce.
    await page.waitForTimeout(500);

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      page,
      'provider form with name "openrouter", base URL filled, OpenResponses driver, empty Models section',
    );
  });

  await test.step("02. Add a model to the provider", async () => {
    // Exercise
    await page.getByRole("button", { name: /Add model/i }).click();
    await page
      .getByRole("textbox", { name: /^ID$/i })
      .fill("openai/gpt-oss-120b");
    await page
      .getByRole("textbox", { name: /^Name$/i })
      .last()
      .fill("GPT OSS 120b");

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      page,
      'model row with ID "openai/gpt-oss-120b", name "GPT OSS 120b", and capability toggles',
    );
  });

  await test.step("03. Set default completion model", async () => {
    // Exercise
    await page
      .getByLabel(/^Model$/i)
      .first()
      .click();
    await page.getByRole("option", { name: /GPT OSS 120b/i }).waitFor();
    await page.getByRole("option", { name: /GPT OSS 120b/i }).click();

    // Verify
    await VisualEvaluator.expectToSee(
      "03.png",
      page,
      'default completion model set to "GPT OSS 120b", reasoning effort defaulted to "Medium"',
    );
  });

  await test.step("04. Change reasoning effort to High", async () => {
    // Exercise
    await page.getByLabel(/^Reasoning effort$/i).click();
    await page.getByRole("option", { name: /^High$/i }).click();

    // Verify
    await VisualEvaluator.expectToSee(
      "04.png",
      page,
      'reasoning effort changed to "High"',
    );
  });

  await test.step("05. Save settings", async () => {
    // Exercise
    await page.getByRole("button", { name: /^Save$/i }).click();
    // Wait for save to complete - the Save button becomes disabled after
    // saving.
    await page.waitForTimeout(1_000);

    // Verify
    await VisualEvaluator.expectToSee(
      "05.png",
      page,
      "settings page with saved inference settings, disabled Save button",
    );
  });
});
