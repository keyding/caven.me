import { expect, test } from "@playwright/test";

test("homepage serves one visible placeholder line", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.locator("body")).toHaveText("Hello, world.");
  expect(await page.locator("body").innerText()).toBe("Hello, world.");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
