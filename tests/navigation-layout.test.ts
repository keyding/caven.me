import { expect, test } from "@playwright/test";

for (const path of ["/", "/zh/"]) {
  test(`navigation and introduction stay in place during refresh on ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => {
      const positions: { nav: number; intro: number }[] = [];
      Object.assign(window, { layoutPositions: positions });
      const sample = () => {
        const nav = document.querySelector("nav");
        const intro = document.querySelector("[data-introduction]");
        if (nav && intro)
          positions.push({
            nav: nav.getBoundingClientRect().height,
            intro: intro.getBoundingClientRect().top,
          });
        if (performance.now() < 1500) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.goto(path);
    await page.reload();
    await page.waitForTimeout(1600);
    const positions = await page.evaluate(
      () => Reflect.get(window, "layoutPositions") as { nav: number; intro: number }[],
    );
    expect(positions.length).toBeGreaterThan(1);
    for (const key of ["nav", "intro"] as const) {
      const values = positions.map((position) => position[key]);
      expect(Math.max(...values) - Math.min(...values)).toBeLessThan(1);
    }
  });
}
