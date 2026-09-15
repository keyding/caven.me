import { expect, test } from "@playwright/test";

test("SVG favicon uses transparent artwork and follows the color scheme", async ({ page }) => {
  await page.goto("/favicon.svg");
  await expect(page.locator("rect")).toHaveCount(0);
  for (const [colorScheme, stroke] of [
    ["light", "rgb(0, 0, 0)"],
    ["dark", "rgb(255, 255, 255)"],
  ] as const) {
    await page.emulateMedia({ colorScheme });
    await expect(page.locator("path").last()).toHaveCSS("stroke", stroke);
    await expect(page.locator("path").last()).toHaveCSS("fill", "none");
  }
});

test("raster favicon uses solid monochrome strokes on a transparent background", async ({
  page,
}) => {
  await page.goto("/");
  const colors = await page.evaluate(async () => {
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]:not([type])')!;
    const image = new Image();
    image.src = icon.href;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 48;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0, 48, 48);
    const pixels = context.getImageData(0, 0, 48, 48).data;
    let light = 0,
      dark = 0,
      transparent = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3]! === 0) transparent++;
      if (pixels[i + 3]! < 200) continue;
      if (pixels[i]! > 220 && pixels[i + 1]! > 220 && pixels[i + 2]! > 220) light++;
      if (pixels[i]! < 80 && pixels[i + 1]! < 80 && pixels[i + 2]! < 80) dark++;
    }
    return { light, dark, transparent };
  });
  expect(colors.light).toBe(0);
  expect(colors.dark).toBeGreaterThan(20);
  expect(colors.transparent).toBeGreaterThan(1000);
});
