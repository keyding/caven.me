import { expect, test } from "@playwright/test";

for (const locale of ["en", "zh"] as const) {
  test(`${locale} homepage retains its language on direct access and refresh`, async ({ page }) => {
    const response = await page.goto(locale === "en" ? "/" : "/zh/");
    expect(response?.status()).toBe(200);
    for (let visit = 0; visit < 2; visit++) {
      await expect(page.locator("html")).toHaveAttribute("lang", locale === "en" ? "en" : "zh-CN");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        locale === "en" ? "Hello, I’m Caven." : "嗨，我是丁强。",
      );
      await expect(
        page.getByText(
          locale === "en"
            ? "Senior Frontend Engineer & Frontend Lead"
            : "高级前端工程师 · 前端技术负责人",
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: locale === "en" ? "Email" : "邮件", exact: true }).first(),
      ).toHaveAttribute("href", "mailto:cavenasdev@gmail.com");
      await expect(page.getByRole("link", { name: "GitHub", exact: true }).first()).toHaveAttribute(
        "href",
        "https://github.com/keyding",
      );
      await page.reload();
    }
  });
}

test("language links preserve project anchors in both directions", async ({ page }) => {
  for (const anchor of ["pwarelay", "lemon-squeezy-sdk", "online-arbitrage-tool"]) {
    await page.goto(`/#${anchor}`);
    await page.getByRole("link", { name: "切换到中文", exact: true }).click();
    await expect(page).toHaveURL(`/zh/#${anchor}`);
    await expect(page.locator(`#${anchor}`)).toBeInViewport();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await page.getByRole("link", { name: "Switch to English", exact: true }).click();
    await expect(page).toHaveURL(`/#${anchor}`);
  }
  await page.goto("/#missing-project");
  await page.getByRole("link", { name: "切换到中文", exact: true }).click();
  await expect(page).toHaveURL("/zh/");
});

for (const locale of ["en", "zh"] as const) {
  test(`${locale} identity is readable, keyboard accessible, and locally typeset`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(locale === "en" ? "/" : "/zh/");
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => {
        const loaded = [...document.fonts].filter((font) => font.status === "loaded");
        return ["Geist", "Instrument Serif"].every((name) =>
          loaded.some((font) => font.family.replaceAll('"', "") === name),
        );
      }),
    ).toBe(true);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Caven", exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    const language = page.getByRole("link", {
      name: locale === "en" ? "切换到中文" : "Switch to English",
      exact: true,
    });
    await expect(language).toBeFocused();
    expect(await language.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe(
      "solid",
    );
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("lang", locale === "en" ? "zh-CN" : "en");
    await page.goBack();
    const email = page.getByRole("button", {
      name: locale === "en" ? "Email" : "邮件",
      exact: true,
    });
    await expect(email).toHaveCount(2);
    for (const link of await email.all())
      await expect(link).toHaveAttribute("href", "mailto:cavenasdev@gmail.com");
    for (const width of testInfo.project.name === "desktop" ? [1280, 2560] : [320, 390]) {
      await page.setViewportSize({ width, height: 850 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
    expect(
      await page
        .locator("main")
        .evaluate((element) => element.getAnimations({ subtree: true }).length),
    ).toBe(0);
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`${locale}-full.png`), fullPage: true });
    await page
      .getByRole("contentinfo")
      .screenshot({ path: testInfo.outputPath(`${locale}-footer.png`) });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`${locale}-intro.png`) });
  });

  test(`${locale} content and contacts survive unavailable JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(locale === "en" ? "/" : "/zh/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("link", { name: locale === "en" ? "Email" : "邮件", exact: true }).first(),
    ).toBeVisible();
    const signature = page.getByRole("contentinfo").getByRole("img", {
      name: locale === "en" ? "Caven signature" : "Caven 签名",
      exact: true,
    });
    await signature.scrollIntoViewIfNeeded();
    await expect(signature).toBeVisible();
    expect(
      await signature.evaluate((element) => element.getAnimations({ subtree: true }).length),
    ).toBe(0);
    await page
      .getByRole("link", {
        name: locale === "en" ? "切换到中文" : "Switch to English",
        exact: true,
      })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", locale === "en" ? "zh-CN" : "en");
    await context.close();
  });
}

test("navigation and footer signatures animate independently, with X beside GitHub", async ({
  page,
}) => {
  await page.goto("/");
  const header = page
    .getByRole("navigation")
    .getByRole("img", { name: "Caven signature", exact: true });
  const footer = page
    .getByRole("contentinfo")
    .getByRole("img", { name: "Caven signature", exact: true });
  await expect(header).toHaveAttribute("data-state", "running");
  await expect(footer).toHaveAttribute("data-state", "pending");
  await expect(header).toHaveAttribute("data-state", "complete");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toHaveAttribute("data-state", "running");
  await expect(header).toHaveAttribute("data-state", "complete");
  await expect(footer).toHaveAttribute("data-state", "complete");
  const x = page.getByRole("link", { name: "X", exact: true });
  await expect(x).toHaveCount(2);
  for (const link of await x.all())
    await expect(link).toHaveAttribute("href", "https://x.com/cavenasdev");
});

test("navigation stays at the top when reading the footer", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation");
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await expect(navigation).toBeInViewport();
  const bounds = await navigation.boundingBox();
  expect(bounds?.y).toBeGreaterThanOrEqual(0);
  expect(bounds?.y).toBeLessThan(40);
});

test("email decrypts on click and synchronizes both contact rows", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const email = page.locator("[data-introduction] [data-email-reveal]");
  await expect(email).toHaveText("Email");
  await email.click();
  await expect(email).not.toHaveText("Email");
  await expect(email).not.toHaveText("cavenasdev@gmail.com");
  await expect(email).toHaveText("cavenasdev@gmail.com");
  await expect(email).toHaveAccessibleName("cavenasdev@gmail.com");
  await expect(email).toHaveAttribute("href", "mailto:cavenasdev@gmail.com");
  await expect(page.locator("footer [data-email-reveal]")).toHaveText("cavenasdev@gmail.com");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("email supports keyboard reveal with reduced motion in Chinese", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/zh/");
  const email = page.locator("[data-introduction] [data-email-reveal]");
  await email.focus();
  await page.keyboard.press("Space");
  await expect(email).toHaveText("cavenasdev@gmail.com");
  await expect(email).toBeFocused();
  await expect(email).not.toHaveAttribute("role", "button");
  const footer = page.locator("footer [data-email-reveal]");
  await footer.focus();
  await expect(footer).toHaveText("cavenasdev@gmail.com");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("email hint is hoverable and dismissible, and social links open new tabs", async ({
  page,
}) => {
  await page.goto("/");
  const email = page.locator("[data-introduction] [data-email-reveal]");
  await email.hover();
  await expect
    .poll(() => email.evaluate((el) => getComputedStyle(el, "::after").opacity))
    .toBe("1");
  const box = await email.boundingBox();
  if (!box) throw new Error("Email control missing");
  await page.mouse.move(box.x + 10, box.y - 10);
  await expect
    .poll(() => email.evaluate((el) => getComputedStyle(el, "::after").opacity))
    .toBe("1");
  await page.keyboard.press("Escape");
  await expect
    .poll(() => email.evaluate((el) => getComputedStyle(el, "::after").opacity))
    .toBe("0");
  for (const name of ["GitHub", "X"]) {
    for (const link of await page.getByRole("link", { name, exact: true }).all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  }
});

test("portrait sits above the greeting on narrow screens and beside it on desktop", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 390, 639, 640, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    const portrait = await page.locator("[data-portrait]").boundingBox();
    const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
    if (!portrait || !heading) throw new Error("Introduction missing");
    expect(portrait.width).toBe(120);
    if (width < 640) expect(portrait.y + portrait.height).toBeLessThanOrEqual(heading.y);
    else expect(portrait.x + portrait.width).toBeLessThan(heading.x);
  }
});

test("Tianjin clock uses Beijing time and advances independently of visitor timezone", async ({
  browser,
}) => {
  const context = await browser.newContext({ timezoneId: "America/New_York" });
  const page = await context.newPage();
  await page.clock.install({ time: new Date("2026-09-15T15:59:59Z") });
  await page.goto("/zh/");
  const clock = page.locator("[data-local-time]");
  await expect(page.locator("[data-location-time]")).toContainText("中国 · 天津");
  await expect(page.locator("[data-location-time]")).not.toContainText("UTC+8");
  await expect(clock).toHaveText("23:59");
  await page.clock.runFor(1000);
  await expect(clock).toHaveText("00:00");
  await expect(clock).toHaveAttribute("datetime", /^2026-09-15T16:00:/);
  await page.goto("/");
  await expect(page.locator("[data-location-time]")).toContainText("Tianjin, China");
  await expect(page.locator("[data-location-time]")).toContainText("UTC+8");
  await expect(clock).toHaveText("00:00");
  await context.close();
});

test("cold font loading uses local WOFF2 files without duplicate requests", async ({ page }) => {
  const requests: string[] = [];
  await page.route(/\.woff2(?:\?|$)/, async (route) => {
    requests.push(route.request().url());
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.continue();
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(requests).toHaveLength(3);
  expect(new Set(requests).size).toBe(3);
  const origin = new URL(page.url()).origin;
  expect(requests.every((url) => new URL(url).origin === origin)).toBe(true);
  expect(
    await page.evaluate(() =>
      [...document.fonts].every((font) => font.display === "block" && font.status === "loaded"),
    ),
  ).toBe(true);
});

test("email reveal persists across reloads, locales and later visits", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.locator("footer [data-email-reveal]").click();
  await expect(page.locator("[data-introduction] [data-email-reveal]")).toHaveText(
    "cavenasdev@gmail.com",
  );
  await page.reload();
  for (const link of await page.locator("[data-email-reveal]").all()) {
    await expect(link).toHaveText("cavenasdev@gmail.com");
    await expect(link).not.toHaveAttribute("role", "button");
  }
  const nextVisit = await context.newPage();
  await nextVisit.goto("/zh/");
  for (const link of await nextVisit.locator("[data-email-reveal]").all()) {
    await expect(link).toHaveText("cavenasdev@gmail.com");
    await expect(link).toHaveAttribute("href", "mailto:cavenasdev@gmail.com");
  }
  await nextVisit.close();
});

test("email reveal still synchronizes when local storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await page.goto("/");
  await page.locator("footer [data-email-reveal]").click();
  for (const link of await page.locator("[data-email-reveal]").all()) {
    await expect(link).toHaveText("cavenasdev@gmail.com");
  }
});
