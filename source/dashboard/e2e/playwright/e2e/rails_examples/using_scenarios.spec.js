import { test, expect } from "@playwright/test";
import { app, appScenario } from '../../support/on-rails.js';

test.describe("Rails using scenarios examples", () => {
  test.beforeEach(async ({ page }) => {
    await app('clean');
  });

  test("setup basic scenario", async ({ page }) => {
    await appScenario('basic');
    await page.goto("/users/sign_in");
    await page.getByLabel("Email").fill("e2e@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log in" }).click();
    await page.getByRole("heading", { name: "Overview" }).waitFor();
  });
});
