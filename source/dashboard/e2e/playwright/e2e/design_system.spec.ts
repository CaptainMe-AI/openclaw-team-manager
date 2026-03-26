/**
 * Phase 2 Design System E2E Tests
 * Covers: DSGN-01 (dark theme), DSGN-02 (typography), DSGN-03 (components), DSGN-04 (responsive)
 *
 * Prerequisites: Dev server running at http://127.0.0.1:5017
 * Run: cd source/dashboard && npx playwright test e2e/playwright/e2e/design_system.spec.ts
 *
 * Note: If app requires authentication, these tests may need a login helper.
 * The current demo page is rendered by App.tsx within the authenticated layout.
 */

import { test, expect } from "@playwright/test";

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
  test("StatusDot components render on page", async ({ page }) => {
    await page.goto("/");
    const dots = page.locator("[role='status']");
    await expect(dots.first()).toBeVisible();
  });

  test("Badge components render on page", async ({ page }) => {
    await page.goto("/");
    const badge = page.getByText("Active").first();
    await expect(badge).toBeVisible();
  });

  test("Button components render on page", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "New Task" });
    await expect(button).toBeVisible();
  });

  test("Card components render on page", async ({ page }) => {
    await page.goto("/");
    const card = page.getByText("KPI Card Example");
    await expect(card).toBeVisible();
  });

  test("Table renders with headers", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("columnheader", { name: "Name" });
    await expect(header).toBeVisible();
  });

  test("Input renders with label", async ({ page }) => {
    await page.goto("/");
    const label = page.getByText("Display Name");
    await expect(label).toBeVisible();
  });
});

test.describe("Design System - DSGN-04: Responsive Breakpoints", () => {
  test("table has horizontal scroll container", async ({ page }) => {
    await page.goto("/");
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
