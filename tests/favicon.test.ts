import { expect, test } from "@playwright/test";

for (const path of ["/", "/zh/"]) {
  test(`${path} favicon candidates follow browser preference on a light page`, async ({ page }) => {
    await page.goto(path);
    for (const colorScheme of ["dark", "light", "dark"] as const) {
      await page.emulateMedia({ colorScheme });
      const colors = await page.evaluate(async () => {
        const icons = [...document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')].filter(
          (icon) => !icon.media || matchMedia(icon.media).matches,
        );
        return Promise.all(
          icons.map(async (icon) => {
            const image = new Image();
            // Render in the real page's light color scheme, not a standalone SVG document.
            document.body.append(image);
            image.src = icon.href;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 64;
            const context = canvas.getContext("2d")!;
            context.drawImage(image, 0, 0, 64, 64);
            image.remove();
            const pixels = context.getImageData(0, 0, 64, 64).data;
            let black = 0,
              white = 0;
            for (let i = 0; i < pixels.length; i += 4) {
              if (pixels[i + 3]! < 200) continue;
              if (pixels[i]! < 50) black++;
              if (pixels[i]! > 220) white++;
            }
            return { black, white };
          }),
        );
      });
      expect(colors.length).toBeGreaterThan(0);
      for (const color of colors) {
        expect(colorScheme === "dark" ? color.black : color.white).toBe(0);
        expect(colorScheme === "dark" ? color.white : color.black).toBeGreaterThan(20);
      }
    }
  });
}

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
