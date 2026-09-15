import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

// Local inputs only: the footer artwork and the site's pinned fonts.
const root = new URL("../", import.meta.url);
const dataUrl = async (path, type) =>
  `data:${type};base64,${(await readFile(new URL(path, root))).toString("base64")}`;
const [art, serif, sans] = await Promise.all([
  dataUrl("public/images/tianchi-footer-study.png", "image/png"),
  dataUrl(
    "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2",
    "font/woff2",
  ),
  dataUrl("node_modules/@fontsource/geist/files/geist-latin-400-normal.woff2", "font/woff2"),
]);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(`<!doctype html><html lang="en"><head><style>
    @font-face { font-family: Display; src: url('${serif}'); }
    @font-face { font-family: Body; src: url('${sans}'); }
    * { box-sizing: border-box; }
    body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #faf9f6; color: #292d32; font-family: Body; }
    img { position: absolute; left: 0; bottom: -8px; width: 1200px; mix-blend-mode: multiply; }
    main { position: relative; padding: 48px 64px; }
    .domain { font-size: 20px; letter-spacing: .04em; color: #616771; }
    h1 { margin: 20px 0 14px; font: 88px/1.05 Display; letter-spacing: -.025em; }
    h1 span { position: relative; }
    h1 span::after { content: ''; position: absolute; left: 5%; right: 0; bottom: -4px; height: 5px; background: #e5bd48; border-radius: 50%; transform: rotate(-2deg); }
    .role { margin: 20px 0 12px; font-size: 26px; }
    .focus { margin: 0; font-size: 19px; color: #616771; }
  </style></head><body><img src="${art}" alt=""/><main>
    <div class="domain">caven.me</div>
    <h1>Hello, I’m <span>Caven.</span></h1>
    <p class="role">Senior Frontend Engineer &amp; Frontend Lead</p>
    <p class="focus">Frontend architecture · PWA · SDKs · Open source</p>
  </main></body></html>`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.decode()));
  });
  await page.screenshot({
    path: fileURLToPath(new URL("public/images/og-caven.jpg", root)),
    type: "jpeg",
    quality: 90,
  });
} finally {
  await browser.close();
}
