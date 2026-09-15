import { expect, test } from "@playwright/test";

for (const locale of ["en", "zh"] as const) {
  test(`${locale} project image opens a keyboard-accessible preview and returns focus`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(locale === "en" ? "/#pwarelay" : "/zh/#pwarelay");
    const trigger = page.getByRole("button", {
      name: locale === "en" ? "Enlarge PWARelay image" : "放大 PWARelay 图片",
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img")).toBeVisible();
    const close = dialog.getByRole("button", {
      name: locale === "en" ? "Close preview" : "关闭预览",
    });
    await expect(close).toBeFocused();
    await expect(
      dialog.getByRole("link", { name: locale === "en" ? "Open original image" : "查看原图" }),
    ).toHaveAttribute("href", "/images/pwarelay-dashboard.webp");
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    expect(await dialog.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Space");
    await expect(dialog).toBeVisible();
    await close.click();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toBeVisible();
  });
}

test("project image opens the original when JavaScript is unavailable", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/zh/#pwarelay");
  await page.getByRole("link", { name: "放大 PWARelay 图片" }).click();
  await expect(page).toHaveURL("/images/pwarelay-dashboard.webp");
  await context.close();
});
