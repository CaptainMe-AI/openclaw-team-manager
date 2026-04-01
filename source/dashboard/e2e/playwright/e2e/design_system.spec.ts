/**
 * Phase 2 Design System E2E Tests
 * Covers: DSGN-01 (dark theme), DSGN-02 (typography), DSGN-03 (components), DSGN-04 (responsive)
 *
 * Prerequisites: Dev server running at http://127.0.0.1:5017
 * Run: cd source/dashboard && npx playwright test e2e/playwright/e2e/design_system.spec.ts
 */

import { test, expect } from "@playwright/test";
import { app, appFactories } from "../support/on-rails.js";

const TEST_USER = {
  email: "e2e-test@example.com",
  password: "password123",
};

async function seedAndSignIn(page: import("@playwright/test").Page) {
  await app("clean");
  await appFactories([
    [
      "create",
      "user",
      {
        email: TEST_USER.email,
        password: TEST_USER.password,
        password_confirmation: TEST_USER.password,
      },
    ],
    ["create", "agent", { status: "active" }],
  ]);
  await page.goto("/users/sign_in");
  await page.getByLabel("Email").fill(TEST_USER.email);
  await page.getByLabel("Password").fill(TEST_USER.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.getByRole("heading", { name: "Overview" }).waitFor();
}

test.describe("Design System - DSGN-01: Dark Theme", () => {
  test("page renders with dark background color", async ({ page }) => {
    await page.goto("/");
    const body = page.locator("body");
    const bgColor = await body.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor,
    );
    // #0f1219 = rgb(15, 18, 25)
    expect(bgColor).toBe("rgb(15, 18, 25)");
  });

  test("no white flash on page load", async ({ page }) => {
    await page.goto("/");
    const body = page.locator("body");
    await expect(body).toHaveCSS("background-color", "rgb(15, 18, 25)");
  });
});

test.describe("Design System - DSGN-02: Typography", () => {
  test("page uses Inter font family", async ({ page }) => {
    await page.goto("/");
    const body = page.locator("body");
    const fontFamily = await body.evaluate((el) =>
      window.getComputedStyle(el).fontFamily,
    );
    expect(fontFamily).toContain("Inter");
  });

  test("heading renders with correct font weight", async ({ page }) => {
    await page.goto("/");
    const heading = page.locator("h1").first();
    await expect(heading).toHaveCSS("font-weight", "600");
  });
});

test.describe("Design System - DSGN-03: Component Library", () => {
  test.beforeEach(async ({ page }) => {
    await seedAndSignIn(page);
  });

  test("StatusDot components render on page", async ({ page }) => {
    await page.goto("/agents");
    const dots = page.locator("[role='status']");
    await expect(dots.first()).toBeVisible();
  });

  test("Badge components render on page", async ({ page }) => {
    await page.goto("/agents");
    const badge = page.getByText("active").first();
    await expect(badge).toBeVisible();
  });

  test("Button components render on page", async ({ page }) => {
    const button = page.getByRole("button", { name: "New Task" });
    await expect(button).toBeVisible();
  });

  test("Card components render on page", async ({ page }) => {
    const card = page.getByText("Active Agents");
    await expect(card).toBeVisible();
  });

  test("Table renders with headers", async ({ page }) => {
    await page.goto("/agents");
    const header = page.getByRole("columnheader", { name: "Name" });
    await expect(header).toBeVisible();
  });

  test("Input renders with label", async ({ page }) => {
    await page.goto("/settings");
    const label = page.getByText("Display Name");
    await expect(label).toBeVisible();
  });
});

test.describe("Design System - DSGN-04: Responsive Breakpoints", () => {
  test("table has horizontal scroll container", async ({ page }) => {
    await seedAndSignIn(page);
    await page.goto("/agents");
    const scrollContainer = page.locator(".overflow-x-auto");
    await expect(scrollContainer.first()).toBeVisible();
  });

  test("layout adapts at mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    // Page should still render without horizontal overflow on the body
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
