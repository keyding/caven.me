import { expect, test } from "@playwright/test";

test("SVG favicon uses transparent artwork and follows the color scheme", async ({ page }) => {
  await page.goto("/favicon.svg");
  await expect(page.locator("rect")).toHaveCount(0);
  for (const [colorScheme, stroke] of [
    ["light", "rgb(41, 45, 50)"],
    ["dark", "rgb(255, 255, 255)"],
  ] as const) {
    await page.emulateMedia({ colorScheme });
    await expect(page.locator("path").first()).toHaveCSS("stroke", stroke);
    await expect(page.locator("path").first()).toHaveCSS("fill", "none");
  }
});
