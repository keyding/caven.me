import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });
for (const [path, locale] of [
  ["/", "en_US"],
  ["/zh/", "zh_CN"],
] as const) {
  test(`static sharing metadata matches the locale on ${path}`, async ({ page }) => {
    await page.goto(path);
    const canonical = `https://caven.me${path}`;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", locale);
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.length).toBeGreaterThan(40);
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      await expect(page.locator(selector)).toHaveAttribute("content", title);
    }
    for (const selector of [
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ]) {
      await expect(page.locator(selector)).toHaveAttribute("content", description!);
    }
    for (const [language, suffix] of [
      ["en", "/"],
      ["zh-CN", "/zh/"],
      ["x-default", "/"],
    ]) {
      await expect(page.locator(`link[hreflang="${language}"]`)).toHaveAttribute(
        "href",
        `https://caven.me${suffix}`,
      );
    }
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[name="twitter:creator"]')).toHaveAttribute(
      "content",
      "@cavenasdev",
    );
    for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
      await expect(page.locator(selector)).toHaveAttribute(
        "content",
        "https://caven.me/images/og-caven.jpg",
      );
    }
    const person = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!,
    );
    expect(person).toMatchObject({
      "@type": "Person",
      name: "Caven",
      url: "https://caven.me/",
      sameAs: ["https://github.com/keyding", "https://x.com/cavenasdev"],
    });
    const dimensions = await page.evaluate(async () => {
      const image = new Image();
      image.src = "/images/og-caven.jpg";
      await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    });
    expect(dimensions).toEqual([1200, 630]);
    const manifest = await page.request.get("/site.webmanifest");
    expect(manifest.ok()).toBe(true);
    expect(await manifest.json()).toMatchObject({
      name: "Caven — Frontend Engineer",
      display: "browser",
    });
  });
}
