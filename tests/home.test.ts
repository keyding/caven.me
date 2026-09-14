import { expect, test } from "@playwright/test";

test("homepage presents the seven layout regions in reading order without overflow", async ({
  page,
}, testInfo) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const regions = [
    page.getByRole("navigation", { name: "Navigation" }),
    page.getByRole("region", { name: "Introduction", exact: true }),
    page.getByRole("region", { name: "Selected work", exact: true }),
    page.getByRole("region", { name: "Experience", exact: true }),
    page.getByRole("region", { name: "Tech stack", exact: true }),
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
  const landscape = page.getByRole("img", {
    name: "Hand-drawn concept of Changbai Mountain's Tianchi crater lake",
  });
  await landscape.scrollIntoViewIfNeeded();
  await expect(landscape).toBeVisible();
  await expect
    .poll(() => landscape.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.getByRole("img", { name: "Caven signature", exact: true })).toHaveAttribute(
    "data-state",
    "complete",
  );
  await page.getByRole("contentinfo").screenshot({ path: testInfo.outputPath("footer.png") });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath("homepage.png"), fullPage: true });
  const widths = testInfo.project.name === "desktop" ? [1920, 2560] : [320, 390];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    const pageWidth = await page.evaluate(() => document.documentElement.clientWidth);
    const bounds = await landscape.boundingBox();
    expect(bounds).not.toBeNull();
    if (!bounds) throw new Error("Footer illustration has no visible bounds");
    expect(bounds.x).toBeCloseTo(0, 0);
    expect(bounds.width).toBeCloseTo(pageWidth, 0);
    expect(bounds.width / bounds.height).toBeCloseTo(3, 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(pageWidth);
  }
  if (testInfo.project.name === "desktop") {
    await page
      .getByRole("contentinfo")
      .screenshot({ path: testInfo.outputPath("footer-wide.png") });
  }
});

test("experience contributions toggle independently by pointer and keyboard", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const first = page.getByLabel("Role / Position — Company 1", { exact: true });
  const second = page.getByLabel("Role / Position — Company 2", { exact: true });
  const firstContributions = page.getByRole("list", {
    name: "Company 1 contributions",
    exact: true,
  });
  const secondContributions = page.getByRole("list", {
    name: "Company 2 contributions",
    exact: true,
  });
  await expect(firstContributions).toBeVisible();
  await expect(secondContributions).toBeHidden();
  await first.click();
  await expect(firstContributions).toBeHidden();
  await expect(page.getByRole("list", { name: "Company 1 tags", exact: true })).toBeVisible();
  await second.click();
  await expect(secondContributions).toBeVisible();
  await expect(firstContributions).toBeHidden();
  await second.press("Enter");
  await expect(secondContributions).toBeHidden();
  await second.press("Space");
  await expect(secondContributions).toBeVisible();
  await first.click();
  await expect(firstContributions).toBeVisible();
  await expect(secondContributions).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page
    .getByRole("region", { name: "Experience", exact: true })
    .screenshot({ path: testInfo.outputPath("experience-expanded.png") });
});

test("signature writes once when scrolled into view", async ({ page }, testInfo) => {
  await page.goto("/");
  const signature = page.getByRole("img", { name: "Caven signature", exact: true });
  await expect(signature).toHaveAttribute("data-state", "pending");
  await signature.scrollIntoViewIfNeeded();
  await expect(signature).toHaveAttribute("data-state", "running");
  await expect
    .poll(() => signature.evaluate((element) => element.getAnimations({ subtree: true }).length))
    .toBe(6);
  await page.waitForTimeout(700);
  await signature.screenshot({ path: testInfo.outputPath("signature-writing.png") });
  await expect(signature).toHaveAttribute("data-state", "complete");
  await expect
    .poll(() => signature.evaluate((element) => element.getAnimations({ subtree: true }).length))
    .toBe(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await signature.scrollIntoViewIfNeeded();
  await expect(signature).toHaveAttribute("data-state", "complete");
});

test("signature stays complete with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const signature = page.getByRole("img", { name: "Caven signature", exact: true });
  await signature.scrollIntoViewIfNeeded();
  await expect(signature).toHaveAttribute("data-state", "complete");
  expect(
    await signature.evaluate((element) => element.getAnimations({ subtree: true }).length),
  ).toBe(0);
});

test("signature crossings do not reveal later strokes", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4321/");
  const signature = page.getByRole("img", { name: "Caven signature", exact: true });
  await signature.evaluate((element) => element.setAttribute("data-state", "running"));
  for (const time of [700, 1100]) {
    await signature.evaluate((element, time) => {
      for (const animation of element.getAnimations({ subtree: true })) {
        animation.pause();
        animation.currentTime = time;
      }
    }, time);
    await expect(signature).toHaveScreenshot(`signature-crossing-${time}.png`, {
      animations: "allow",
    });
  }
  await context.close();
});
