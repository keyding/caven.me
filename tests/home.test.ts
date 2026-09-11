import { expect, test } from "@playwright/test";

test("homepage presents the six layout regions in reading order without overflow", async ({
  page,
}, testInfo) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const regions = [
    page.getByRole("navigation", { name: "Navigation" }),
    page.getByRole("region", { name: "Introduction", exact: true }),
    page.getByRole("region", { name: "Selected work", exact: true }),
    page.getByRole("region", { name: "Experience", exact: true }),
    page.getByRole("region", { name: "Additional work", exact: true }),
    page.getByRole("contentinfo"),
  ];
  let previousBottom = 0;
  for (const region of regions) {
    await expect(region).toBeVisible();
    const box = await region.boundingBox();
    expect(box).not.toBeNull();
    if (!box) throw new Error("Layout region has no visible bounds");
    expect(box.y).toBeGreaterThanOrEqual(previousBottom);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    previousBottom = box.y + box.height;
  }
  await expect(page.getByRole("heading", { name: "Introduction", exact: true })).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath("homepage.png"), fullPage: true });
});
