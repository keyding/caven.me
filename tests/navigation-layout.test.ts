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

test("introduction fades finish visibly and respect reduced motion", async ({ page }) => {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    const stages = page.locator(
      "[data-intro-stage], [data-intro-contacts] a, [data-intro-contacts] [data-location-time]",
    );
    await expect(stages).toHaveCount(6);
    if (reducedMotion === "reduce") {
      expect(
        await stages.evaluateAll(
          (elements) => elements.flatMap((element) => element.getAnimations()).length,
        ),
      ).toBe(0);
    } else {
      const opacities = await page
        .locator("[data-intro-contacts] a, [data-intro-contacts] [data-location-time]")
        .evaluateAll((elements) =>
          elements.map((element) => {
            for (const animation of element.getAnimations()) {
              animation.pause();
              animation.currentTime = 650;
            }
            return Number(getComputedStyle(element).opacity);
          }),
        );
      for (let index = 1; index < opacities.length; index++) {
        expect(opacities[index - 1]).toBeGreaterThan(opacities[index]);
      }
      await stages.evaluateAll((elements) =>
        elements.forEach((element) =>
          element.getAnimations().forEach((animation) => animation.play()),
        ),
      );
      await stages.evaluateAll(async (elements) => {
        await Promise.all(
          elements.flatMap((element) =>
            element.getAnimations().map((animation) => animation.finished),
          ),
        );
      });
    }
    for (const stage of await stages.all()) {
      await expect(stage).toHaveCSS("opacity", "1");
      await expect(stage).toHaveCSS("transform", "none");
      await expect(stage).toHaveCSS("filter", "none");
    }
  }
});
