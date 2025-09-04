import { test, expect, devices } from "@playwright/test";

test.describe("Mobile Scroll Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Emulate iPhone viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
  });

  test("should allow vertical scrolling on mobile homepage", async ({
    page,
  }) => {
    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);

    // Perform swipe down gesture to scroll
    await page.mouse.move(200, 300);
    await page.mouse.down();
    await page.mouse.move(200, 100, { steps: 10 });
    await page.mouse.up();

    // Wait a bit for scroll to complete
    await page.waitForTimeout(500);

    // Check if page scrolled
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeGreaterThan(0);

    console.log(
      `Initial scroll: ${initialScrollY}, Final scroll: ${finalScrollY}`
    );
  });

  test("should allow scrolling on test scroll page", async ({ page }) => {
    await page.goto("/test-scroll");
    await page.waitForLoadState("networkidle");

    // Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Perform swipe up gesture to scroll down
    await page.mouse.move(200, 400);
    await page.mouse.down();
    await page.mouse.move(200, 100, { steps: 10 });
    await page.mouse.up();

    // Wait for scroll
    await page.waitForTimeout(500);

    // Check if page scrolled
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeGreaterThan(initialScrollY);

    // Should be able to see section 2
    await expect(page.locator("text=Section 2")).toBeVisible();
  });

  test("should allow scrolling with filters open", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Open mobile filter
    const filterButton = page.locator("text=Фільтри").first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Close filter
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // Try to scroll after filter interaction
    await page.mouse.move(200, 300);
    await page.mouse.down();
    await page.mouse.move(200, 100, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(500);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  test("should maintain scroll with price slider interaction", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Open filters if on mobile
    const filterButton = page.locator("text=Фільтри").first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Try to interact with price slider (if visible)
      const slider = page.locator(".price-slider").first();
      if (await slider.isVisible()) {
        await slider.hover();
        // Don't actually drag - just hover to test touch-action
      }

      // Close filter
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // Verify page can still scroll
    await page.mouse.move(200, 300);
    await page.mouse.down();
    await page.mouse.move(200, 100, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(500);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });
});

test.describe("Desktop Scroll Tests", () => {
  test("should work normally on desktop", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Scroll with wheel
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(300);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });
});
