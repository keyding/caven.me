import { expect, test } from "@playwright/test";

for (const path of ["/", "/zh/"]) {
  test(`fonts are consumed after load and refresh on ${path}`, async ({ page }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (/preloaded.*not used/i.test(message.text())) warnings.push(message.text());
    });
    await page.goto(path);
    // Chromium emits unused-preload warnings a few seconds after the load event.
    await page.waitForTimeout(6000);
    await page.reload();
    await page.waitForTimeout(6000);
    expect(warnings).toEqual([]);
  });
}
