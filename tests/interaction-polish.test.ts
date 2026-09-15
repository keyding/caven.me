import { expect, test } from "@playwright/test";

for (const key of ["Enter", "Space"]) {
  test(`keyboard ${key} reveals email immediately without reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const email = page.locator("[data-introduction] [data-email-reveal]");
    await email.focus();
    await page.keyboard.press(key);
    expect(await email.textContent()).toContain("cavenasdev@gmail.com");
    await expect(page.locator("footer [data-email-reveal]")).toHaveText("cavenasdev@gmail.com");
  });
}

test("a second click finishes email decoding immediately", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const email = page.locator("[data-introduction] [data-email-reveal]");
  await email.click();
  await expect(email).not.toHaveText("cavenasdev@gmail.com");
  await email.click();
  expect(await email.textContent()).toContain("cavenasdev@gmail.com");
});

test("navigation signature plays once per tab session across reload and language switch", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const signature = page.locator("header [data-signature]");
  await expect(signature).toHaveAttribute("data-state", "running");
  await page.reload();
  expect(await signature.getAttribute("data-state")).toBe("complete");
  await page.goto("/zh/");
  expect(await signature.getAttribute("data-state")).toBe("complete");
  const freshTab = await context.newPage();
  await freshTab.goto("/");
  await expect(freshTab.locator("header [data-signature]")).toHaveAttribute(
    "data-state",
    "running",
  );
});

test("tooltip delays mouse hover, excludes touch hover and shows keyboard focus instantly", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const email = page.locator("[data-introduction] [data-email-reveal]");
  const supportsHover = await page.evaluate(
    () => matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  await email.hover();
  const style = () =>
    email.evaluate((el) => {
      const css = getComputedStyle(el, "::after");
      return {
        opacity: css.opacity,
        delay: css.transitionDelay,
        duration: css.transitionDuration,
        easing: css.transitionTimingFunction,
      };
    });
  if (supportsHover) {
    expect((await style()).delay).toBe("0.2s, 0.2s, 0.2s");
    expect((await style()).duration).toBe("0.16s, 0.16s, 0s");
    expect((await style()).easing).toContain("cubic-bezier(0.23, 1, 0.32, 1)");
    await expect.poll(async () => (await style()).opacity).toBe("1");
    await page.mouse.move(0, 0);
    expect((await style()).duration).toBe("0.1s, 0.1s, 0s");
    await expect.poll(async () => (await style()).opacity).toBe("0");
  } else {
    await page.waitForTimeout(400);
    expect((await style()).opacity).toBe("0");
  }
  await email.focus();
  expect((await style()).opacity).toBe("1");
  expect((await style()).duration).toBe("0s");
  await page.keyboard.press("Escape");
  await expect.poll(async () => (await style()).opacity).toBe("0");
});

test("reduced motion keeps the tooltip stationary on hover", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const email = page.locator("[data-introduction] [data-email-reveal]");
  const hover = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
  if (hover) await email.hover();
  else await email.focus();
  const style = await email.evaluate((el) => {
    const css = getComputedStyle(el, "::after");
    return { opacity: css.opacity, transform: css.transform, duration: css.transitionDuration };
  });
  expect(style).toEqual({ opacity: "1", transform: "none", duration: "0s" });
});
