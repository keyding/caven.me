import { expect, test } from "@playwright/test";

for (const locale of ["en", "zh"] as const) {
  test(`${locale} PWARelay explains the project and offers only verified destinations`, async ({
    page,
  }) => {
    await page.goto(locale === "en" ? "/#pwarelay" : "/zh/#pwarelay");
    const project = page.getByRole("article", { name: "PWARelay", exact: true });
    await expect(project).toBeInViewport();
    await expect(project).toContainText(locale === "en" ? "Independent developer" : "独立开发者");
    await expect(project).toContainText(locale === "en" ? "reusable SDKs" : "可复用的 SDK");
    await expect(
      project.getByRole("link", { name: locale === "en" ? "Website" : "网站", exact: true }),
    ).toHaveAttribute("href", "https://pwarelay.com");
    await expect(
      project.getByRole("link", { name: locale === "en" ? "Source code" : "源代码", exact: true }),
    ).toHaveCount(0);
    await expect(project.getByRole("img")).toHaveCount(0);
  });

  test(`${locale} PWARelay stays readable through refresh, keyboard navigation and translation`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const path = locale === "en" ? "/" : "/zh/";
    await page.goto(`${path}#pwarelay`);
    await page.reload();
    const project = page.getByRole("article", { name: "PWARelay", exact: true });
    await expect(project).toBeInViewport();
    await expect(page).toHaveURL(`${path}#pwarelay`);
    const anchor = project.getByRole("link", { name: "PWARelay", exact: true });
    await anchor.focus();
    await page.keyboard.press("Tab");
    const website = project.getByRole("link", {
      name: locale === "en" ? "Website" : "网站",
      exact: true,
    });
    await expect(website).toBeFocused();
    expect(await website.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
    await expect(website).toHaveAttribute("target", "_blank");
    await expect(website).toHaveAttribute("rel", "noopener noreferrer");
    await anchor.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(`${path}#pwarelay`);
    expect(await project.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    for (const width of testInfo.project.name === "desktop" ? [1280, 2560] : [320, 390]) {
      await page.setViewportSize({ width, height: 850 });
      await anchor.scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const heading = await anchor.boundingBox();
      const navigation = await page.getByRole("navigation").boundingBox();
      expect(heading!.y).toBeGreaterThanOrEqual(navigation!.y + navigation!.height);
    }
    await page.screenshot({ path: testInfo.outputPath(`${locale}-project.png`) });
    await page
      .getByRole("link", {
        name: locale === "en" ? "切换到中文" : "Switch to English",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(`${locale === "en" ? "/zh/" : "/"}#pwarelay`);
    await expect(project).toContainText(locale === "en" ? "独立开发者" : "Independent developer");
    await expect(project).toBeInViewport();
  });
}

test("PWARelay content and links work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const path of ["/", "/zh/"]) {
    await page.goto(`${path}#pwarelay`);
    const project = page.getByRole("article", { name: "PWARelay", exact: true });
    await expect(project).toBeInViewport();
    await expect(project.getByRole("link", { name: "PWARelay", exact: true })).toHaveAttribute(
      "href",
      "#pwarelay",
    );
    await expect(project.getByRole("link").last()).toHaveAttribute("href", "https://pwarelay.com");
  }
  await context.close();
});
