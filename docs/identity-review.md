# Bilingual identity review — issue #4

## Scope and source

The layout approval is recorded in `docs/layout-review.md` (2026-09-14); issue #3
is closed. This slice retains its 768px column, borderless warm-white sections,
hand-drawn underlines, signature contours and 2.65-second one-time reveal, and
full-width Tianchi illustration.

Identity, introduction, email and GitHub were checked against the supplied Chinese
resume, `丁强 - 高级前端工程师.pdf`, on 2026-09-14. The introduction summarizes its
frontend architecture, mobile interaction, PWA, SDK, React/TypeScript, team delivery,
independent product and open-source experience without adding dates, metrics, or
employer/project claims. The English and Chinese versions have equivalent meaning.
The source document was only read, and is not included in this repository.
The portrait is its existing square image, resized to a 400px WebP.

Project, experience, toolkit and additional-work details remain localized
placeholders for #5–7. Their real content and a public resume download are outside
this slice. The language switch uses `/` and `/zh/`, preserves valid fragment IDs
with JavaScript, and falls back to native locale navigation without JavaScript.

## Browser evidence

The production build was rendered in Chromium at desktop and phone sizes.
The following captures were visually inspected for mixed-script typography,
wrapping, portrait quality, whitespace, and footer composition:

- [English mobile, 390px](identity-evidence/en-mobile.png)
- [Chinese mobile, 390px](identity-evidence/zh-mobile.png)
- [English wide desktop, 2560px](identity-evidence/en-desktop.png)
- [Chinese footer, 2560px](identity-evidence/zh-footer-wide.png)

Horizontal containment is checked at 320, 390, 1280, and 2560px. These are real
browser renders with viewport/device emulation, not physical-phone testing.
Fontsource supplies local Instrument Serif and Geist; Chinese uses available
system serif/sans-serif fallbacks, so exact Chinese glyphs vary by platform.

## Approval status

The signature reuses the user-selected Bastliga One outline and previously approved
animation from #3. The Tianchi illustration remains the existing candidate.
Final signature/artwork approval was requested against the rendered footer during
this implementation; it is not inferred from the earlier structure approval.
Until explicitly confirmed, this is an outstanding visual acceptance item for #4.

## Validation

The first identity tests failed against the old page (placeholder heading and
Chinese HTTP 404); they passed after implementation. The fragment-switching test
then failed because navigation dropped the project fragment, and passed after
adding the native-link enhancement.

The same built-site Playwright suite checks both locales, direct access and
refresh, all three project fragments, unknown-fragment recovery, keyboard
navigation and visible focus, actual email/GitHub destinations, loaded fonts,
reduced motion, and readable content without JavaScript. Existing layout,
independent disclosure and signature regressions remain in the suite.
CI runs formatting, lint, Astro/TypeScript checking, a production build and the
full browser suite on PRs and main. It uploads browser evidence and failure traces.
No deployment or domain configuration is included.

Local result: formatting, lint and Astro/TypeScript checks passed (zero diagnostics);
the full built-site suite passed **24/24** across desktop and mobile projects.
The retained signature snapshot is now captured at a fixed viewport origin, so
font-driven subpixel page positioning cannot alter its crop. Both updated mobile
baseline images were visually inspected; original contours are unchanged.

## Standards review

The independent review found no documented architectural violations or actionable
Fowler smell findings. It identified one accidental CSS selector grouping that
applied icon dimensions to project/role labels. The text-container inline-flex
rule was restored, then the full suite and rendered Experience layout were checked.

## Spec review

The independent review found the same layout regression, now fixed, and the
outstanding final-artwork approval described above. Identity, routes, contact,
typography, fallback behavior and CI match the slice; no scope creep was identified.
