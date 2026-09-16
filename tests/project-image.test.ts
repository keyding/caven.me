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

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`close icon gives pointer-only feedback with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/zh/#pwarelay");
    const trigger = page.getByRole("button", { name: "放大 PWARelay 图片" });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    const close = dialog.getByRole("button", { name: "关闭预览" });
    const icon = close.locator("svg");
    await close.hover();
    await page.mouse.down();
    await expect(icon).toHaveCSS("transition-duration", "0.1s");
    await expect(icon).toHaveCSS(
      "transform",
      reducedMotion === "reduce" ? "matrix(1, 0, 0, 1, 0, 0)" : "matrix(0.96, 0, 0, 0.96, 0, 0)",
    );
    await expect(icon).toHaveCSS("opacity", reducedMotion === "reduce" ? "0.85" : "1");
    const bounds = await close.boundingBox();
    expect(bounds?.width).toBe(44);
    expect(bounds?.height).toBe(44);
    await page.mouse.up();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await close.focus();
    await page.keyboard.down("Space");
    await expect(icon).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
    await expect(icon).toHaveCSS("opacity", "1");
    await expect(icon).toHaveCSS("transition-duration", "0s");
    await page.keyboard.up("Space");
    await expect(dialog).not.toBeVisible();
  });
}

test("close feedback cancels without moving the target or delaying dismissal", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#pwarelay");
  const trigger = page.getByRole("button", { name: "Enlarge PWARelay image" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "Close preview" });
  const icon = close.locator("svg");
  const imageBounds = await dialog.getByRole("img").boundingBox();
  if (!imageBounds) throw new Error("Preview image has no bounds");
  await close.hover();
  await page.mouse.down();
  await expect(icon).toHaveCSS("transform", "matrix(0.96, 0, 0, 0.96, 0, 0)");
  await page.mouse.move(imageBounds.x + 20, imageBounds.y + 20);
  await expect(icon).toHaveCSS("transition-duration", "0s");
  await expect(icon).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await close.hover();
  await expect(icon).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await page.mouse.move(imageBounds.x + 20, imageBounds.y + 20);
  await page.mouse.up();
  await expect(dialog).toBeVisible();

  // Synthetic cancellation covers events Playwright cannot generate as native gestures.
  for (const event of ["pointercancel", "lostpointercapture", "blur", "keydown"]) {
    await close.dispatchEvent("pointerdown", { isPrimary: true, button: 0 });
    await expect(icon).toHaveCSS("transform", "matrix(0.96, 0, 0, 0.96, 0, 0)");
    await close.dispatchEvent(event);
    await expect(icon).toHaveCSS("transition-duration", "0s");
    await expect(icon).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  }
  for (const pointer of [
    { isPrimary: true, button: 2 },
    { isPrimary: false, button: 0 },
  ]) {
    await close.dispatchEvent("pointerdown", pointer);
    await expect(icon).toHaveCSS("transition-duration", "0s");
    await expect(icon).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  }
  await close.dispatchEvent("pointerdown", { isPrimary: true, button: 0 });
  expect(
    await close.evaluate((button) => {
      if (!(button instanceof HTMLButtonElement)) throw new Error("Expected close button");
      button.click();
      return button.closest("dialog")?.open;
    }),
  ).toBe(false);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(icon).toHaveCSS("transition-duration", "0s");
  await expect(icon).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await page.keyboard.press("Enter");
  await expect(dialog).not.toBeVisible();
});
