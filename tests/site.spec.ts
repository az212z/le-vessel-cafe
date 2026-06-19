import { test, expect } from "@playwright/test";

test.describe("LE VESSEL CAFE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads with RTL Arabic and correct title", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page).toHaveTitle(/لي فيسل/);
  });

  test("preloader is removed", async ({ page }) => {
    await page.waitForTimeout(1500);
    const display = await page.locator("#preloader").evaluate(
      (el) => getComputedStyle(el).display
    );
    expect(display).toBe("none");
  });

  test("hero headline and CTAs visible", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: "اطلب الآن" }).first()).toBeVisible();
  });

  test("trust bar cites Google rating", async ({ page }) => {
    await expect(page.getByText(/تقييم 4.6 على خرائط قوقل/)).toBeVisible();
  });

  test("all images load (no broken)", async ({ page }) => {
    const imgs = page.locator("img");
    const count = await imgs.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const ok = await imgs.nth(i).evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
      );
      expect(ok).toBeTruthy();
    }
  });

  test("full-screen mobile menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#burger").click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    const box = await menu.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(380);
    await page.locator("#menu-close").click();
    await expect(menu).toBeHidden();
  });

  test("order form validates and builds wa.me link", async ({ page }) => {
    await page.locator("#order-submit").click();
    await expect(page.locator('.field-error[data-for="name"]')).toHaveText(/فضلاً/);

    await page.fill("#name", "أحمد");
    await page.fill("#phone", "0567603326");
    await page.selectOption("#drink", "حلى");

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      page.locator("#order-submit").click(),
    ]);
    expect(popup.url()).toContain("wa.me/966567603326");
  });

  test("no horizontal scroll at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
