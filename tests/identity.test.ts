import { expect, test } from "@playwright/test";

for (const locale of ["en", "zh"] as const) {
  test(`${locale} homepage retains its language on direct access and refresh`, async ({ page }) => {
    const response = await page.goto(locale === "en" ? "/" : "/zh/");
    expect(response?.status()).toBe(200);
    for (let visit = 0; visit < 2; visit++) {
      await expect(page.locator("html")).toHaveAttribute("lang", locale === "en" ? "en" : "zh-CN");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        locale === "en" ? "Caven" : "丁强 / Caven",
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
        page.getByRole("link", { name: locale === "en" ? "Email" : "邮件", exact: true }).first(),
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
    for (let step = 0; step < 3; step++) await page.keyboard.press("Tab");
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
    const email = page.getByRole("link", { name: locale === "en" ? "Email" : "邮件", exact: true });
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
    const signature = page.getByRole("img", {
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
